sap.ui.define([
    "./BaseController", // Use the new BaseController
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], (BaseController, MessageToast, Filter, FilterOperator, JSONModel, MessageBox) => { // Update parameters
    "use strict";

    return BaseController.extend("sapips.training.employeeapp.controller.AddEmployee", {
        onInit() {
            const oView = this.getView();
            const oEmployeeIdInput = oView.byId("inEmployeeId");
            this.getView().setModel(new JSONModel([]), "skillsModel");

            if (oEmployeeIdInput) {
                oEmployeeIdInput.setValue("EmployeeID");
                oEmployeeIdInput.setEditable(false);
            } else {
                console.error("Input field with ID 'inEmployeeId' not found in onInit.");
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
            this.getView().byId("inFirstName").setValue("");
            this.getView().byId("inLastName").setValue("");
            this.getView().byId("inAge").setValue("");
            this.getView().byId("DP1").setDateValue(new Date());
            this.getView().byId("inCareerLevel").setSelectedKey("");
            this.getView().byId("inCareerLevel").setValue("");
            this.getView().byId("inCurrentProject").setSelectedKey("");
            this.getView().byId("inCurrentProject").setValue("");
            this.getView().byId("inEmployeeId").setValue("EmployeeID");
            this.getView().getModel("skillsModel").setData([]);
        },

        _updateEmployeeId: function() {
            const oView = this.getView();
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
            const generatedId = "EmployeeID" + sFirstName + sLastName + sDay + sMonth;
            if (oEmployeeIdInput) {
                oEmployeeIdInput.setValue(generatedId);
            }
        },

        onInputChangeForId: function() {
            this._updateEmployeeId();
        },

        onAddCreate: function() {
            var oView = this.getView();
            var firstName = oView.byId("inFirstName").getValue();
            var lastName = oView.byId("inLastName").getValue();
            var oDatePicker = oView.byId("DP1").getValue();
            var oEmployeeIdInput = oView.byId("inEmployeeId").getValue();
            var age = oView.byId("inAge").getValue();
            var alphaRegex = /^[a-zA-Z]+$/;
            var oComboBoxCL = this.byId("inCareerLevel");
            var sValueCL = oComboBoxCL.getValue();
            var sSelectedKeyCL = oComboBoxCL.getSelectedKey();
            var oComboBoxCP = this.byId("inCurrentProject");
            var sValueCP = oComboBoxCP.getValue();
            var sSelectedKeyCP = oComboBoxCP.getSelectedKey();

            if (!alphaRegex.test(firstName) || !alphaRegex.test(lastName) || age < 0 || age > 90 || (sValueCL !== "" && sSelectedKeyCL === "") || (sValueCP !== "" && sSelectedKeyCP === "")) {
                MessageToast.show("Please correct the invalid fields.");
                return;
            }

            this._fnCreateEmployee(firstName, lastName, oEmployeeIdInput, age, oDatePicker, sValueCL, sValueCP);
        },

        _fnCreateEmployee: async function(firstName, lastName, oEmployeeIdInput, age, oDatePicker, sValueCL, sValueCP) {
            if (this.getView().getModel("skillsModel").getData().length === 0) {
                MessageToast.show("Add Skills first before saving");
                return;
            }

            var oData = {
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
                MessageToast.show("Failed to create employee. Please check the console for details.");
            }
        },

        onAddSkillsCreate: async function() {
            const oView = this.getView();
            const oEmployeeIdInput = oView.byId("inEmployeeId").getValue();
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
                this.onCloseDialog(); 
                MessageToast.show("Skill created successfully!");
            } catch (oError) {
                MessageBox.error("Failed to create skill. Please check the console for details.");
            }
        },

        onDeleteEmployeeSkill: function() {
            var oTable = this.getView().byId("listEmployee");
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
            this._navigateBack("RouteEmployeeList");
        }
    });
});