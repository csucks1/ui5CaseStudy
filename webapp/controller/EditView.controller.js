sap.ui.define([
    "./BaseController", // Use the new BaseController
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], (BaseController, MessageToast, Filter, FilterOperator, JSONModel, MessageBox) => { // Update parameters
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
                MessageToast.show("Employee ID not found for editing.");
                this.onCancel();
            }
        },

        _filterSkills: function(sEmployeeID) {
            const oSkillsModel = this.getView().getModel("skillsModel");
            const aFilter = [new Filter("EmployeeeId", FilterOperator.EQ, sEmployeeID)];
            this._onReadQuery(oSkillsModel, aFilter, "/Skill");
        },

        onEdit: function() {
            var oView = this.getView();
            var firstName = oView.byId("inFirstNameEdit").getValue();
            var lastName = oView.byId("inLastNameEdit").getValue();
            var oDatePicker = oView.byId("DP1Edit").getValue();
            var oEmployeeIdInput = oView.byId("inEmployeeIdEdit").getValue();
            var age = oView.byId("inAgeEdit").getValue();
            var alphaRegex = /^[a-zA-Z]+$/;
            var oComboBoxCL = this.byId("inCareerLevelEdit");
            var sValueCL = oComboBoxCL.getValue();
            var sSelectedKeyCL = oComboBoxCL.getSelectedKey();
            var oComboBoxCP = this.byId("inCurrentProjectEdit");
            var sValueCP = oComboBoxCP.getValue();
            var sSelectedKeyCP = oComboBoxCP.getSelectedKey();

            if (!alphaRegex.test(firstName) || !alphaRegex.test(lastName) || age < 0 || age > 90 || (sValueCL !== "" && sSelectedKeyCL === "") || (sValueCP !== "" && sSelectedKeyCP === "")) {
                MessageToast.show("Please correct the invalid fields.");
                return;
            }

            this._fnEditEmployee(firstName, lastName, oEmployeeIdInput, age, oDatePicker, sValueCL, sValueCP);
        },

        _fnEditEmployee: async function(firstName, lastName, oEmployeeIdInput, age, oDatePicker, sValueCL, sValueCP) {
            if (this.getView().getModel("skillsModel").getData().length === 0) {
                MessageToast.show("Employee must have at least one skill.");
                return;
            }

            var oData = {
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
                MessageToast.show("Failed to update employee. Please check the console for details.");
            }
        },

        onAddSkillsCreate: async function() {
            const oView = this.getView();
            const oEmployeeIdInput = oView.byId("inEmployeeIdEdit").getValue();
            var oSkill = this.byId("inSkillList");
            var sValueSkill = oSkill.getValue();
            var sSelectedKeySkill = oSkill.getSelectedKey();
            var oProficient = this.byId("inSProficient");
            var sValueProficient = oProficient.getValue();
            var sSelectedKeyProficient = oProficient.getSelectedKey();

            if ((sValueSkill !== "" && sSelectedKeySkill === "") || (sValueProficient !== "" && sSelectedKeyProficient === "")) {
                MessageToast.show("Only entries from the lists are valid.");
                return;
            }

            var oData = {
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
                this.onCloseDialog(); // Use inherited method
                MessageToast.show("Skill created successfully!");
            } catch (oError) {
                MessageBox.error("Failed to create skill. Please check the console for details.");
            }
        },

        onDeleteEmployeeSkill: function() {
            var oTable = this.getView().byId("listEmployeeEdit");
            var aSelectedItems = oTable.getSelectedItems();
            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select at least one skill to delete.");
                return;
            }

            MessageBox.confirm("Are you sure you want to delete the selected skill(s)?", {
                title: "Confirm Deletion",
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