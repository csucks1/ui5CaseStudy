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

    // this code defines the AddEmployee controller, extending the BaseController
    return BaseController.extend("sapips.training.employeeapp.controller.AddEmployee", {
        // this code is the onInit lifecycle method, which is called when the controller is instantiated
        onInit() {
            // this code gets a reference to the view
            const oView = this.getView();
            // this code gets the resource bundle for internationalization (i18n)
            const oResourceBundle = this.getResourceBundle();
            // this code gets a reference to the Employee ID input field
            const oEmployeeIdInput = oView.byId("inEmployeeId");
            // this code creates and sets a new JSONModel named "skillsModel" to hold skill data
            this.getView().setModel(new JSONModel([]), "skillsModel");

            // this code checks if the Employee ID input field was found
            if (oEmployeeIdInput) {
                // this code sets the default value for the Employee ID from the resource bundle
                oEmployeeIdInput.setValue(oResourceBundle.getText("defaultEmployeeId"));
                // this code makes the Employee ID input field non-editable
                oEmployeeIdInput.setEditable(false);
            } else {
                // this code logs an error to the console if the input field is not found
                console.error(oResourceBundle.getText("devConsoleErrorInputNotFound", ["inEmployeeId"]));
            }

            // this code gets a reference to the DatePicker control
            var oDatePicker = this.byId("DP1");
            // this code sets the DatePicker's value to the current date
            oDatePicker.setDateValue(new Date());

            // this code creates a new Date object for setting the maximum allowed date
            var oMaxDate = new Date();
            // this code sets the maximum year to one year from the current year
            oMaxDate.setFullYear(new Date().getFullYear() + 1);
            // this code applies the maximum date to the DatePicker
            oDatePicker.setMaxDate(oMaxDate);

            // this code gets the application's router instance
            const oRouter = this.getOwnerComponent().getRouter();
            // this code attaches the _onRouteMatched function to be called whenever the "RouteAddEmployee" route is matched
            oRouter.getRoute("RouteAddEmployee").attachPatternMatched(this._onRouteMatched, this);
        },

        // this code is a function that runs every time the user navigates to this view
        _onRouteMatched: function() {
            // this code gets the resource bundle for i18n texts
            const oResourceBundle = this.getResourceBundle();
            // this code resets the value of the First Name input field
            this.getView().byId("inFirstName").setValue("");
            // this code resets the value of the Last Name input field
            this.getView().byId("inLastName").setValue("");
            // this code resets the value of the Age input field
            this.getView().byId("inAge").setValue("");
            // this code resets the DatePicker to the current date
            this.getView().byId("DP1").setDateValue(new Date());
            // this code resets the selected key of the Career Level ComboBox
            this.getView().byId("inCareerLevel").setSelectedKey("");
            // this code resets the value of the Career Level ComboBox
            this.getView().byId("inCareerLevel").setValue("");
            // this code resets the selected key of the Current Project ComboBox
            this.getView().byId("inCurrentProject").setSelectedKey("");
            // this code resets the value of the Current Project ComboBox
            this.getView().byId("inCurrentProject").setValue("");
            // this code resets the Employee ID to its default value
            this.getView().byId("inEmployeeId").setValue(oResourceBundle.getText("defaultEmployeeId"));
            // this code clears the data in the skillsModel, resetting the skills list
            this.getView().getModel("skillsModel").setData([]);
        },

        // this code contains validation functions
        // this code validates the First Name input field
        _validateFirstNameInput: function() {
            this._validateAlpha("inFirstName", "invalidFieldName");
        },        

        // this code validates the Last Name input field
        _validateLastNameInput: function () {
            this._validateAlpha("inLastName", "invalidFieldName");
        },
        
        // this code validates the Age input field
        _validateAgeInput: function () {
            this._validateNumeric("inAge", "invalidAge", 0, 90);
        },

        // this code validates the Career Level ComboBox input
        validateCLInput: function () {
            this._validateComboBox("inCareerLevel", "invalidListEntry");
        },

        // this code validates the Current Project ComboBox input
        validateProjectInput: function () {
            this._validateComboBox("inCurrentProject", "invalidListEntry");
        },        

        // this code dynamically updates the generated Employee ID based on other form inputs
        _updateEmployeeId: function() {
            // this code gets a reference to the view and resource bundle
            const oView = this.getView();
            const oResourceBundle = this.getResourceBundle();
            // this code gets the trimmed values from the name fields
            const sFirstName = oView.byId("inFirstName").getValue().trim();
            const sLastName = oView.byId("inLastName").getValue().trim();
            // this code gets references to the DatePicker and Employee ID input
            const oDatePicker = oView.byId("DP1");
            const oEmployeeIdInput = oView.byId("inEmployeeId");

            let sDay = "";
            let sMonth = "";

            // this code gets the date value from the DatePicker
            const oDateValue = oDatePicker.getDateValue();
            // this code checks if a date has been selected
            if (oDateValue) {
                // this code formats the day and month to be two digits (e.g., 01, 09)
                sDay = String(oDateValue.getDate()).padStart(2, '0');
                sMonth = String(oDateValue.getMonth() + 1).padStart(2, '0');
            }
            // this code constructs the Employee ID string
            const generatedId = oResourceBundle.getText("defaultEmployeeId") + sFirstName + sLastName + sDay + sMonth;
            // this code checks if the Employee ID input exists
            if (oEmployeeIdInput) {
                // this code sets the new generated ID to the input field
                oEmployeeIdInput.setValue(generatedId);
            }
        },

        // this code is an event handler, likely for the 'liveChange' event of name and date inputs
        onInputChangeForId: function() {
            // this code runs validation on the first name
            this._validateFirstNameInput();
            // this code runs validation on the last name
            this._validateLastNameInput();
            // this code runs validation on the age
            this._validateAgeInput();
            // this code updates the Employee ID based on the new input
            this._updateEmployeeId();
        },

        // this code is the event handler for the main "Create" button
        onAddCreate: function() {
            // this code gets references to the view and resource bundle
            const oView = this.getView();
            const oResourceBundle = this.getResourceBundle();
            // this code gets all the values from the form fields
            const firstName = oView.byId("inFirstName").getValue();
            const lastName = oView.byId("inLastName").getValue();
            const oDatePicker = oView.byId("DP1").getValue();
            const oEmployeeIdInput = oView.byId("inEmployeeId").getValue();
            const age = oView.byId("inAge").getValue();
            // this code defines a regex for non-empty alphabetic strings for final validation
            const alphaRegex = /^[a-zA-Z]+$/;
            // this code gets references and values for the ComboBoxes
            const oComboBoxCL = this.byId("inCareerLevel");
            const sValueCL = oComboBoxCL.getValue();
            const sSelectedKeyCL = oComboBoxCL.getSelectedKey();
            const oComboBoxCP = this.byId("inCurrentProject");
            const sValueCP = oComboBoxCP.getValue();
            const sSelectedKeyCP = oComboBoxCP.getSelectedKey();

            // this code performs a final validation check on all fields before saving
            if (!alphaRegex.test(firstName) || !alphaRegex.test(lastName) || age < 0 || age > 90 || (sValueCL !== "" && sSelectedKeyCL === "") || (sValueCP !== "" && sSelectedKeyCP === "")) {
                // this code shows a message if any field is invalid
                MessageToast.show(oResourceBundle.getText("invalidFields"));
                return; // this code stops the function execution
            }
            // this code calls the internal function to create the employee if all validations pass
            this._fnCreateEmployee(firstName, lastName, oEmployeeIdInput, age, oDatePicker, sValueCL, sValueCP);
        },

        // this code is a helper function to handle the actual creation of the employee record
        _fnCreateEmployee: async function(firstName, lastName, oEmployeeIdInput, age, oDatePicker, sValueCL, sValueCP) {
            // this code gets the resource bundle
            const oResourceBundle = this.getResourceBundle();
            // this code checks if any skills have been added for the employee
            if (this.getView().getModel("skillsModel").getData().length === 0) {
                // this code shows a message prompting the user to add skills
                MessageToast.show(oResourceBundle.getText("addSkillsBeforeSave"));
                return; // this code stops execution
            }

            // this code prepares the data payload for the OData service
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
                // this code calls a generic create function (likely in BaseController) to send the data to the "/Employee" entity set
                await this._onCreateQuery(oData, "/Employee");
                // this code navigates back to the employee list view on successful creation
                this.getOwnerComponent().getRouter().navTo("RouteEmployeeList");
            } catch (oError) {
                // this code shows an error message if the creation fails
                MessageToast.show(oResourceBundle.getText("employeeCreateError"));
            }
        },

        // this code handles the creation or update of a skill
        onAddSkillsCreate: async function() {
            this.onAddSkills("inEmployeeId");
        },        

        // this code handles the deletion of a skill from the list
        onDeleteEmployeeSkill: function() {
            this.onDeleteSkill("listEmployee");
        },

        // this code handles the "Cancel" button action
        onCancel: function() {
            // this code uses a helper function (likely in BaseController) to navigate back to the main employee list
            this._navigateBack("RouteEmployeeList");
        }
    });
});