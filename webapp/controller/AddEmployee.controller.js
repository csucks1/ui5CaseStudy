sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], (Controller, MessageToast, Filter, FilterOperator, JSONModel, MessageBox, History) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.AddEmployee", {
        onInit() {
            const oView = this.getView();
            const oEmployeeIdInput = oView.byId("inEmployeeId"); 
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

        // queries
        _onCreateQuery: function (oData, sEntity) {
            //===================
            // Create New Entry
            //===================
            //Get the Model
            var oModel = this.getOwnerComponent().getModel();
            // OData CREATE operation
                oModel.create(sEntity, oData, {
                    success: (data) => { // Arrow function
                     
                    },
                    error: (oError) => { 
                        console.error("Error creating employee:", oError);
                    }
                });
        },

        _onReadQuery: function (oSkillsModel, aFilter, sFilterUri) {
            var oModel = this.getOwnerComponent().getModel();
            
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
                return;
            } else if (!alphaRegex.test(lastName)) {
                MessageToast.show("Last name must contain only letters.");
                return;
            } else if (age < 0 || age > 90) {
                MessageToast.show("Age cannot be less than 0 or more than 90");
                return;
            } else if (sValueCL !== "" && sSelectedKeyCL === "") { // user manually input
                MessageToast.show("Only entries from current career level list are valid");
                return;
            } else if (sValueCP !== "" && sSelectedKeyCP === "") { // user manually input
                MessageToast.show("Only entries from current project list are valid");
                return;
            } else {
                try{
                    this._fnCreateEmployee(firstName, lastName, oEmployeeIdInput, age, oDatePicker, sValueCL,sValueCP);    
                } catch (oError) {
                    console.log(oError);
                    MessageToast.show("Failed to create employee. Please check the console for details.");                   
                }                        
            }     
        },

        _fnCreateEmployee: function(firstName, lastName, oEmployeeIdInput, age, oDatePicker, sValueCL,sValueCP) {
            // Get the model
            var oSkillsModel = this.getView().getModel("skillsModel");
        
            // Get the data from the model
            var aSkills = oSkillsModel.getData(); // This returns the entire array []
        
            // Check if the array is not null and has items
            if (aSkills && aSkills.length > 0) {
                var oData = {
                    FirstName: firstName,
                    LastName: lastName,
                    EmployeeID: oEmployeeIdInput,
                    Age: age,
                    DateHire: oDatePicker,
                    CareerLevel: sValueCL ,
                    CurrentProject: sValueCP
                };

                var sEntity = "/Employee"
                // onAddCreate function
                try {
                    this._onCreateQuery(oData, sEntity);
                    const oRouter = this.getOwnerComponent().getRouter();                     
                    oRouter.navTo("RouteEmployeeList");

                } catch (oError) {
                    console.log(oError);
                    MessageToast.show("Failed to create employee. Please check the console for details.");
                } 
            } else {
                MessageToast.show("Add Skills first before saving");
                return;
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
        onAddSkillsCreate: async function () {
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
                var sEntity = "/Skill"    
                const oView = this.getView();
                const oSkillsModel = oView.getModel("skillsModel"); 
                var aFilter = [];
                aFilter.push(new Filter({
                    path: "EmployeeeId",
                    operator: FilterOperator.EQ,
                    value1: oEmployeeIdInput
                }));
                // onAddCreate function
                try {
                    await this._onCreateQuery(oData, sEntity);
                    await this._onReadQuery(oSkillsModel, aFilter, sEntity);
                    this.getView().byId("idSkillDialog").close();
                    MessageToast.show("Skills created successfully!");

                } catch (oError) {
                    MessageBox.error("Failed to create employee. Please check the console for details.");
                }            
            }
            
        },

        onDeleteEmployeeSkill: function () {
            var oTable = this.getView().byId("listEmployee");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select at least one skill to delete.");
                return;
            }


            var oModel = this.getOwnerComponent().getModel();

            // 3. Confirmation Dialog for good user experience
            MessageBox.confirm("Are you sure you want to delete the selected skill(s)?", {
                title: "Confirm Deletion",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {                      
                        try{
                            this._performDelete(aSelectedItems, oModel);
                        } catch (oError) {

                        }
                    }
                }.bind(this) // .bind(this) is crucial to keep the controller's context
            });
        },

        _performDelete: function (aSelectedItems, oModel) {
            const oSkillsModel = this.getView().getModel("skillsModel");
            let aCurrentSkills = oSkillsModel.getData();

            // Step 1: Collect the keys of all items to be deleted.
            // Don't modify anything yet!
            const aSkillsToDelete = aSelectedItems.map(oItem => {
                return oItem.getBindingContext("skillsModel").getObject();
            });

            // Step 2 & 3: Process backend deletions and prepare frontend update
            aSkillsToDelete.forEach(oSkillData => {
                const sEmployeeId = oSkillData.EmployeeeId;
                const sSkillId = oSkillData.SkillId;

                // Backend Deletion
                const sPath = oModel.createKey("/Skill", {
                    EmployeeeId: sEmployeeId,
                    SkillId: sSkillId
                });
                oModel.remove(sPath, { /* success/error handlers are optional here */ });
            });

            // Step 4: Update the client-side JSONModel efficiently.
            // We create a new array containing only the skills that were NOT marked for deletion.
            const aSkillsToKeep = aCurrentSkills.filter(oExistingSkill => {
                // Return true to keep the item, false to remove it.
                // The 'find' will return an object (truthy) if the skill is in the deletion list.
                return !aSkillsToDelete.find(oSkillToDelete => 
                    oSkillToDelete.EmployeeeId === oExistingSkill.EmployeeeId && 
                    oSkillToDelete.SkillId === oExistingSkill.SkillId
                );
            });

            // Set the new, filtered data on the model
            oSkillsModel.setData(aSkillsToKeep);
            // oSkillsModel.refresh() is also an option after setting data.

            MessageToast.show(aSkillsToDelete.length + " skill(s) deleted.");
        },

        onCancel: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            var oRouter = this.getOwnerComponent().getRouter();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                oRouter.navTo("RouteEmployeeList", {}, true);
            }
        }        

        // ... other functions like onAddCreate, onInputChangeForId etc. ...
    });
});