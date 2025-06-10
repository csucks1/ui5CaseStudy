sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/library"
], (BaseController, MessageToast, Filter, FilterOperator, JSONModel, MessageBox, library) => {
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

        

        // skills
        onAddSkillsCreate: async function() {
            this.onAddSkills("inEmployeeIdEdit");
        },         

        onDeleteEmployeeSkill: function() {
            this.onDeleteSkill("listEmployeeEdit");
        },

        onCancel: function() {
            const sEmployeeID = this.getView().byId("inEmployeeIdEdit").getValue();
            this._navigateBack("RouteDetailList", { EmployeeID: sEmployeeID });
        },


        // validations
        _validateFirstNameInput: function() {
            this._validateAlpha("inFirstNameEdit", "invalidFieldName");
        },        

        _validateLastNameInput: function () {
            this._validateAlpha("inLastNameEdit", "invalidFieldName");
        },
        
        _validateAgeInput: function () {
            this._validateNumeric("inAgeEdit", "invalidAge", 0, 90);
        },

        validateCLInput: function () {
            this._validateComboBox("inCareerLevelEdit", "invalidListEntry");
        },

        validateProjectInput: function () {
            this._validateComboBox("inCurrentProjectEdit", "invalidListEntry");
        },

        onInputChangeForId: function() {
            // this code runs validation on the first name
            this._validateFirstNameInput();
            // this code runs validation on the last name
            this._validateLastNameInput();
            // this code runs validation on the age
            this._validateAgeInput();
        },        
    });
});