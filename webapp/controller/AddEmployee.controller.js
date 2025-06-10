sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], (BaseController, MessageToast, Filter, FilterOperator, JSONModel, MessageBox) => {
    "use strict";

    return BaseController.extend("sapips.training.employeeapp.controller.AddEmployee", {
        onInit() {
            const oView = this.getView();
            const oResourceBundle = this.getResourceBundle();
            const oEmployeeIdInput = oView.byId("inEmployeeId");
            this.getView().setModel(new JSONModel([]), "skillsModel");

            if (oEmployeeIdInput) {
                oEmployeeIdInput.setValue(oResourceBundle.getText("defaultEmployeeId"));
                oEmployeeIdInput.setEditable(false);
            } else {
                console.error(oResourceBundle.getText("devConsoleErrorInputNotFound", ["inEmployeeId"]));
            }

            var oDatePicker = this.byId("DP1");
            oDatePicker.setDateValue(new Date());

            var oMaxDate = new Date();
            oMaxDate.setFullYear(new Date().getFullYear() + 1);
            oDatePicker.setMaxDate(oMaxDate);

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteAddEmployee").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function() {
            const oResourceBundle = this.getResourceBundle();
            this.getView().byId("inFirstName").setValue("");
            this.getView().byId("inLastName").setValue("");
            this.getView().byId("inAge").setValue("");
            this.getView().byId("DP1").setDateValue(new Date());
            this.getView().byId("inCareerLevel").setSelectedKey("");
            this.getView().byId("inCareerLevel").setValue("");
            this.getView().byId("inCurrentProject").setSelectedKey("");
            this.getView().byId("inCurrentProject").setValue("");
            this.getView().byId("inEmployeeId").setValue(oResourceBundle.getText("defaultEmployeeId"));
            this.getView().getModel("skillsModel").setData([]);
        },

        _updateEmployeeId: function() {
            const oView = this.getView();
            const oResourceBundle = this.getResourceBundle();
            const sFirstName = oView.byId("inFirstName").getValue().trim();
            const sLastName = oView.byId("inLastName").getValue().trim();
            const oDatePicker = oView.byId("DP1");
            const oEmployeeIdInput = oView.byId("inEmployeeId");

            let sDay = "";
            let sMonth = "";

            const oDateValue = oDatePicker.getDateValue();
            if (oDateValue) {
                sDay = String(oDateValue.getDate()).padStart(2, '0');
                sMonth = String(oDateValue.getMonth() + 1).padStart(2, '0');
            }
            const generatedId = oResourceBundle.getText("defaultEmployeeId") + sFirstName + sLastName + sDay + sMonth;
            if (oEmployeeIdInput) {
                oEmployeeIdInput.setValue(generatedId);
            }
        },

        onInputChangeForId: function() {
            this._updateEmployeeId();
        },

        onAddCreate: function() {
            const oView = this.getView();
            const oResourceBundle = this.getResourceBundle();
            const firstName = oView.byId("inFirstName").getValue();
            const lastName = oView.byId("inLastName").getValue();
            const oDatePicker = oView.byId("DP1").getValue();
            const oEmployeeIdInput = oView.byId("inEmployeeId").getValue();
            const age = oView.byId("inAge").getValue();
            const alphaRegex = /^[a-zA-Z]+$/;
            const oComboBoxCL = this.byId("inCareerLevel");
            const sValueCL = oComboBoxCL.getValue();
            const sSelectedKeyCL = oComboBoxCL.getSelectedKey();
            const oComboBoxCP = this.byId("inCurrentProject");
            const sValueCP = oComboBoxCP.getValue();
            const sSelectedKeyCP = oComboBoxCP.getSelectedKey();

            if (!alphaRegex.test(firstName) || !alphaRegex.test(lastName) || age < 0 || age > 90 || (sValueCL !== "" && sSelectedKeyCL === "") || (sValueCP !== "" && sSelectedKeyCP === "")) {
                MessageToast.show(oResourceBundle.getText("invalidFields"));
                return;
            }

            this._fnCreateEmployee(firstName, lastName, oEmployeeIdInput, age, oDatePicker, sValueCL, sValueCP);
        },

        _fnCreateEmployee: async function(firstName, lastName, oEmployeeIdInput, age, oDatePicker, sValueCL, sValueCP) {
            const oResourceBundle = this.getResourceBundle();
            if (this.getView().getModel("skillsModel").getData().length === 0) {
                MessageToast.show(oResourceBundle.getText("addSkillsBeforeSave"));
                return;
            }

            const oData = {
                FirstName: firstName,
                LastName: lastName,
                EmployeeID: oEmployeeIdInput,
                Age: age,
                DateHire: oDatePicker,
                CareerLevel: sValueCL,
                CurrentProject: sValueCP
            };

            try {
                await this._onCreateQuery(oData, "/Employee");
                this.getOwnerComponent().getRouter().navTo("RouteEmployeeList");
            } catch (oError) {
                MessageToast.show(oResourceBundle.getText("employeeCreateError"));
            }
        },

        onAddSkillsCreate: async function() {
            const oView = this.getView();
            const oResourceBundle = this.getResourceBundle();
            const oEmployeeIdInput = oView.byId("inEmployeeId").getValue();
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
            const oTable = this.getView().byId("listEmployee");
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
            this._navigateBack("RouteEmployeeList");
        }
    });
});