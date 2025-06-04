sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, Filter, FilterOperator, JSONModel) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.AddEmployee", {
        onInit() {
            const oView = this.getView();
            const oEmployeeIdInput = oView.byId("inEmployeeId");
            this.getView().setModel(new JSONModel({}), "employeeModel"); 
            this.getView().setModel(new JSONModel([]), "skillsModel");   

            if (oEmployeeIdInput) {
                // Set initial value for Employee ID, make it non-editable
                oEmployeeIdInput.setValue("EmployeeID"); // Initial prefix
                oEmployeeIdInput.setEditable(false);
            } else {
                console.error("Input field with ID 'inEmployeeId' not found in onInit.");
            }            
            
            // default value system date
            var oDatePicker = this.byId("DP1");
            oDatePicker.setDateValue(new Date());     

            // Allow future dates no longer than 1 year
            var oMaxDate = new Date();
            oMaxDate.setFullYear(new Date().getFullYear() + 1); 
            oDatePicker.setMaxDate(oMaxDate);       
            
            // since oninit can only be when the view is first created 
            // we will use attachPatternMatched so every time we are backed in this view
            // it will trigger the function that will reset our inputs
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteAddEmployee").attachPatternMatched(this._onRouteMatched, this);            
        },

        // This function will be called every time the "RouteAddEmployee" is matched
        _onRouteMatched: function () {
            this.getView().byId("inFirstName").setValue("");
            this.getView().byId("inLastName").setValue("");
            this.getView().byId("inAge").setValue("");
            this.getView().byId("DP1").setDateValue(new Date()); // Set default date
            this.getView().byId("inCareerLevel").setSelectedKey("");
            this.getView().byId("inCareerLevel").setValue("");
            this.getView().byId("inCurrentProject").setSelectedKey("");
            this.getView().byId("inCurrentProject").setValue(""); 

            // Reset Employee ID (important!)
            this.getView().byId("inEmployeeId").setValue("EmployeeID"); // Set initial prefix
            this.getView().getModel("skillsModel").setData([]); // Clear skills list
        },        
        
        _updateEmployeeId: function () {
            const oView = this.getView();
            const sFirstName = oView.byId("inFirstName").getValue().trim();
            const sLastName = oView.byId("inLastName").getValue().trim();
            const oDatePicker = oView.byId("DP1");
            const oEmployeeIdInput = oView.byId("inEmployeeId");
            
            let sDay = "";
            let sMonth = "";

            if (oDatePicker) {
                const oDateValue = oDatePicker.getDateValue(); // Gets the JavaScript Date object
                if (oDateValue) { // Check if a date is actually selected
                    const day = oDateValue.getDate();
                    const month = oDateValue.getMonth() + 1; // JavaScript months are 0-indexed (0-11)

                    sDay = String(day).padStart(2, '0');     // Ensure two digits, e.g., 01, 09, 10
                    sMonth = String(month).padStart(2, '0'); // Ensure two digits, e.g., 01, 09, 12
                }
            }            
            const generatedId = "EmployeeID" + sFirstName + sLastName + sDay + sMonth;
            if (oEmployeeIdInput) {
                oEmployeeIdInput.setValue(generatedId);
            }
        },

        onInputChangeForId: function() {
            this._updateEmployeeId();
            // Optional: If you want to clear validation state on live change
            // oEvent.getSource().setValueState("None");
        },
                
        onAddCreate: function () {
            var oView = this.getView();
            var firstName = oView.byId("inFirstName").getValue();
            var lastName = oView.byId("inLastName").getValue();
            var oDatePicker = oView.byId("DP1").getValue();
            var oEmployeeIdInput = oView.byId("inEmployeeId").getValue();
            var age = oView.byId("inAge").getValue();

            var alphaRegex = /^[a-zA-Z]+$/;

            var oComboBoxCL = this.byId("inCareerLevel");
            var sValueCL = oComboBoxCL.getValue(); // The current text in the input field
            var sSelectedKeyCL = oComboBoxCL.getSelectedKey(); // The key of the selected item  


            var oComboBoxCP = this.byId("inCurrentProject");
            var sValueCP = oComboBoxCP.getValue(); // The current text in the input field
            var sSelectedKeyCP = oComboBoxCP.getSelectedKey(); // The key of the selected item          
    
            if (!alphaRegex.test(firstName)) {
                MessageToast.show("First name must contain only letters.");
            } else if (!alphaRegex.test(lastName)) {
                MessageToast.show("Last name must contain only letters.");
            } else if (age < 0 || age > 90) {
                MessageToast.show("Age cannot be less than 0 or more than 90");
            } else if (sValueCL !== "" && sSelectedKeyCL === "") { // user manually input
                MessageToast.show("Only entries from current career level list are valid");
            } else if (sValueCP !== "" && sSelectedKeyCP === "") { // user manually input
                MessageToast.show("Only entries from current project list are valid");
            } else {

            var oData = {
                FirstName: firstName,
                LastName: lastName,
                EmployeeID: oEmployeeIdInput,
                Age: age,
                DateHire: oDatePicker,
                CareerLevel: sValueCL ,
                CurrentProject: sValueCP
            };

            //===================
            // Create New Entry
            //===================
            //Get the Model
            var oModel = this.getOwnerComponent().getModel();
            var sEntity = "/Employee"

            // OData CREATE operation
                oModel.create(sEntity, oData, {
                    success: (data) => { // Arrow function
                        MessageToast.show("Insert Successfully"); 
                        const oRouter = this.getOwnerComponent().getRouter(); 
                        oRouter.navTo("RouteEmployeeList");                       
                    },
                    error: (oError) => { 
                        console.error("Error creating employee:", oError);
                        MessageBox.error("Failed to create employee."); 
                    }
                });
            }     
        },


        // open dialog skills
        onAddItem: function (){
            if (!this.oDialog) {
                this.oDialog = this.loadFragment({
                    name: "sapips.training.employeeapp.fragment.SkillDialog"
                });
            } 
            this.oDialog.then(function(oDialog) {
                oDialog.open();
            });
        }, 
        
        onCloseDialog: function (){
            this.getView().byId("idSkillDialog").close();
        },  

        // add employee skills
        onAddSkillsCreate: function () {
            const oView = this.getView();
            const oEmployeeIdInput = oView.byId("inEmployeeId").getValue();

            var oSkill = this.byId("inSkillList");
            var sValueSkill = oSkill.getValue(); // The current text in the input field
            var sSelectedKeySkill = oSkill.getSelectedKey(); // The key of the selected item             

            var oProficient = this.byId("inSProficient");
            var sValueProficient = oProficient.getValue(); // The current text in the input field
            var sSelectedKeyProficient = oProficient.getSelectedKey(); // The key of the selected item 

            if (sValueSkill !== "" && sSelectedKeySkill === "") { // user manually input
                MessageToast.show("Only entries from skill list are valid");
            } else if (sValueProficient !== "" && sSelectedKeyProficient === "") { // user manually input
                MessageToast.show("Only entries from proficient list are valid");
            } else {
                var oData = {
                    EmployeeeId: oEmployeeIdInput,
                    SkillId: sSelectedKeySkill,
                    ProficiencyID: sSelectedKeyProficient,
                    SkillName: sValueSkill,
                    ProficiencyLevel: sValueProficient
                };
            //===================
            // Create New Entry
            //===================
            //Get the Model
            var oModel = this.getOwnerComponent().getModel();
            var sEntity = "/Skill"

            // OData CREATE operation
                oModel.create(sEntity, oData, {
                    success: (data) => { // Arrow function
                        MessageToast.show("Insert Successfully"); 
                        // employee skill filter
                        const oView = this.getView();
                        const oSkillsModel = oView.getModel("skillsModel"); 
                        var oModel = this.getOwnerComponent().getModel();
                        var aFilter = [];
                        aFilter.push(new Filter({
                            path: "EmployeeeId",
                            operator: FilterOperator.EQ,
                            value1: oEmployeeIdInput
                        }));
            
                        var sFilterUri = "/Skill"
                        
                        oModel.read(sFilterUri, {
                            filters: aFilter,
                            success: function(data){
                                var aData = data.results;
                                if (oSkillsModel) {
                                    oSkillsModel.setData(aData);
                                }                                 
                            },
                            error: function(data){
                                console.error("something wrong employee", data);
                            }
                        })
                        this.getView().byId("idSkillDialog").close();                                 
                    },
                    error: (oError) => { 
                        console.error("Error creating employee:", oError);
                        MessageBox.error("Failed to create employee."); 
                    }
                });                  
            }
            
        }
    });
});