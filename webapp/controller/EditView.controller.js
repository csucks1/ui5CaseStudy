sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], (BaseController, MessageToast, Filter, FilterOperator, JSONModel, MessageBox) => {
    "use strict";

    return BaseController.extend("sapips.training.employeeapp.controller.EditView", {
        onInit() {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteEditEmployee").attachPatternMatched(this._onObjectMatched, this);
            this.getView().setModel(new JSONModel([]), "skillsModel");
        },

        _onObjectMatched: function(oEvent) {
            const sEmployeeID = oEvent.getParameter("arguments").EmployeeID;
            if (sEmployeeID) {
                this._sEmployeeId = sEmployeeID;
                const sPath = "/Employee('" + sEmployeeID + "')";
                this.getView().bindElement({ path: sPath });
                this._filterSkills(sEmployeeID);
            } else {
                MessageToast.show(this.getResourceBundle().getText("employeeIdNotFoundForEdit"));
                this.onCancel();
            }
        },

        _filterSkills: function(sEmployeeID) {
            const oSkillsModel = this.getView().getModel("skillsModel");
            const aFilter = [new Filter("EmployeeeId", FilterOperator.EQ, sEmployeeID)];
            this._onReadQuery(oSkillsModel, aFilter, "/Skill");
        },

        onEdit: function() {
            const oView = this.getView();
            const oResourceBundle = this.getResourceBundle();
            const firstName = oView.byId("inFirstNameEdit").getValue();
            const lastName = oView.byId("inLastNameEdit").getValue();
            const oDatePicker = oView.byId("DP1Edit").getValue();
            const oEmployeeIdInput = oView.byId("inEmployeeIdEdit").getValue();
            const age = oView.byId("inAgeEdit").getValue();
            const alphaRegex = /^[a-zA-Z]+$/;
            const oComboBoxCL = this.byId("inCareerLevelEdit");
            const sValueCL = oComboBoxCL.getValue();
            const sSelectedKeyCL = oComboBoxCL.getSelectedKey();
            const oComboBoxCP = this.byId("inCurrentProjectEdit");
            const sValueCP = oComboBoxCP.getValue();
            const sSelectedKeyCP = oComboBoxCP.getSelectedKey();

            if (!alphaRegex.test(firstName) || !alphaRegex.test(lastName) || age < 0 || age > 90 || (sValueCL !== "" && sSelectedKeyCL === "") || (sValueCP !== "" && sSelectedKeyCP === "")) {
                MessageToast.show(oResourceBundle.getText("invalidFields"));
                return;
            }

            this._fnEditEmployee(firstName, lastName, oEmployeeIdInput, age, oDatePicker, sValueCL, sValueCP);
        },

        _fnEditEmployee: async function(firstName, lastName, oEmployeeIdInput, age, oDatePicker, sValueCL, sValueCP) {
            const oResourceBundle = this.getResourceBundle();
            if (this.getView().getModel("skillsModel").getData().length === 0) {
                MessageToast.show(oResourceBundle.getText("employeeMustHaveSkill"));
                return;
            }

            const oData = {
                FirstName: firstName,
                LastName: lastName,
                Age: age,
                DateHire: oDatePicker,
                CareerLevel: sValueCL,
                CurrentProject: sValueCP
            };

            const sEntityPath = this.getOwnerComponent().getModel().createKey("/Employee", {
                EmployeeID: oEmployeeIdInput
            });

            try {
                await this._onUpdateQuery(oData, sEntityPath);
                this.getOwnerComponent().getRouter().navTo("RouteDetailList", {
                    EmployeeID: oEmployeeIdInput
                });
            } catch (oError) {
                MessageToast.show(oResourceBundle.getText("employeeUpdateError"));
            }
        },

        onAddSkillsCreate: async function() {
            const oView = this.getView();
            const oResourceBundle = this.getResourceBundle();
            const oEmployeeIdInput = oView.byId("inEmployeeIdEdit").getValue();
            const oSkill = this.byId("inSkillList");
            const sValueSkill = oSkill.getValue();
            const sSelectedKeySkill = oSkill.getSelectedKey();
            const oProficient = this.byId("inSProficient");
            const sValueProficient = oProficient.getValue();
            const sSelectedKeyProficient = oProficient.getSelectedKey();

            if ((sValueSkill !== "" && sSelectedKeySkill === "") || (sValueProficient !== "" && sSelectedKeyProficient === "")) {
                MessageToast.show(oResourceBundle.getText("invalidListEntry"));
                return;
            }

            const oData = {
                EmployeeeId: oEmployeeIdInput,
                SkillId: sSelectedKeySkill,
                ProficiencyID: sSelectedKeyProficient,
                SkillName: sValueSkill,
                ProficiencyLevel: sValueProficient
            };

            try {
                await this._onCreateQuery(oData, "/Skill");
                const oSkillsModel = oView.getModel("skillsModel");
                const aFilter = [new Filter("EmployeeeId", FilterOperator.EQ, oEmployeeIdInput)];
                await this._onReadQuery(oSkillsModel, aFilter, "/Skill");
                this.onCloseDialog();
                MessageToast.show(oResourceBundle.getText("skillCreateSuccess"));
            } catch (oError) {
                MessageBox.error(oResourceBundle.getText("skillCreateError"));
            }
        },

        onDeleteEmployeeSkill: function() {
            const oResourceBundle = this.getResourceBundle();
            const oTable = this.getView().byId("listEmployeeEdit");
            const aSelectedItems = oTable.getSelectedItems();
            if (aSelectedItems.length === 0) {
                MessageToast.show(oResourceBundle.getText("selectSkillToDelete"));
                return;
            }

            MessageBox.confirm(oResourceBundle.getText("confirmSkillDeletionMsg"), {
                title: oResourceBundle.getText("confirmDeletionTitle"),
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        this._performDelete(aSelectedItems, this.getOwnerComponent().getModel());
                    }
                }
            });
        },

        onCancel: function() {
            const sEmployeeID = this.getView().byId("inEmployeeIdEdit").getValue();
            this._navigateBack("RouteDetailList", { EmployeeID: sEmployeeID });
        }
    });
});