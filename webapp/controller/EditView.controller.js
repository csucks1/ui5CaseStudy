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
            // It's better for an Edit view to listen to its own route
            const oRouter = this.getOwnerComponent().getRouter();
            // Assuming you have a route named "RouteEditEmployee"
            const oRoute = oRouter.getRoute("RouteEditEmployee");
            oRoute.attachPatternMatched(this._onObjectMatched, this);

            // This is correct for the skills table
            this.getView().setModel(new JSONModel([]), "skillsModel");  
            this.aSelectedSkills = [];
        },

        _onObjectMatched: function (oEvent) {
            const oArguments = oEvent.getParameter("arguments");
            const sEmployeeID = oArguments.EmployeeID;

            if (sEmployeeID) {
                this._sEmployeeId = sEmployeeID;
                console.log("Edit view loaded for employeeId:", sEmployeeID);

                // This part is correct and now works with the updated view bindings
                const sPath = "/Employee('" + sEmployeeID + "')";
                this.getView().bindElement({ path: sPath });

                // Filter skills for this employee
                this._filterSkills(sEmployeeID);
                
            } else {
                MessageToast.show("Employee ID not found for editing.");
                // Optionally navigate back
            }
        },

        _filterSkills: function(sEmployeeID) {
                // filter skills 
                const oView = this.getView();
                const oSkillsModel = oView.getModel("skillsModel"); 
                var oModel = this.getOwnerComponent().getModel();

                var aFilter = [];
                aFilter.push(new Filter({
                    path: "EmployeeeId",
                    operator: FilterOperator.EQ,
                    value1: sEmployeeID
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
        
        _onUpdateQuery: function (oData, sEntity) {
            //===================
            // Create New Entry
            //===================
            //Get the Model
            var oModel = this.getOwnerComponent().getModel();
            // OData CREATE operation
                oModel.update(sEntity, oData, {
                    success: (data) => { // Arrow function
                     
                    },
                    error: (oError) => { 
                        console.error("Error creating employee:", oError);
                    }
                });
        },        
        
        // edit employee
        onEdit: function () {
            var oView = this.getView();
            var firstName = oView.byId("inFirstNameEdit").getValue();
            var lastName = oView.byId("inLastNameEdit").getValue();
            var oDatePicker = oView.byId("DP1Edit").getValue();
            var oEmployeeIdInput = oView.byId("inEmployeeIdEdit").getValue();
            var age = oView.byId("inAgeEdit").getValue();

            var alphaRegex = /^[a-zA-Z]+$/;

            var oComboBoxCL = this.byId("inCareerLevelEdit");
            var sValueCL = oComboBoxCL.getValue(); // The current text in the input field
            var sSelectedKeyCL = oComboBoxCL.getSelectedKey(); // The key of the selected item  


            var oComboBoxCP = this.byId("inCurrentProjectEdit");
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
                this._fnEditEmployee(firstName, lastName, oEmployeeIdInput, age, oDatePicker, sValueCL,sValueCP)
            }
        },

        _fnEditEmployee: function(firstName, lastName, oEmployeeIdInput, age, oDatePicker, sValueCL,sValueCP) {
            // Get the model
            var oSkillsModel = this.getView().getModel("skillsModel");
        
            // Get the data from the model
            var aSkills = oSkillsModel.getData(); // This returns the entire array []
        
            // Check if the array is not null and has items
            if (aSkills && aSkills.length > 0) {
                var oData = {
                    FirstName: firstName,
                    LastName: lastName,
                    Age: age,
                    DateHire: oDatePicker,
                    CareerLevel: sValueCL ,
                    CurrentProject: sValueCP
                };

                var sPath = "Employee"
                var oModel = this.getOwnerComponent().getModel();
                const sEntity = oModel.createKey("/" + sPath, {
                    EmployeeID: oEmployeeIdInput 
                });                

                try {
                    this._onUpdateQuery(oData, sEntity);
                    this.getOwnerComponent().getRouter().navTo("RouteDetailList", {
                        EmployeeID: oEmployeeIdInput
                    });                    
                } catch (oError) {
                    console.log(oError);
                    MessageToast.show("Failed to create employee. Please check the console for details.");
                } 
            } else {
                MessageToast.show("Add Skills first before saving");
                return;
            }
        }, 


        // delete skills
        onSelectEmployee: function () {
            var oTable = this.getView().byId("listEmployeeEdit");
            var aSelectedItems = oTable.getSelectedItems();

            var aSelectedData = aSelectedItems.map(function(oSelectedItem) {
                return oSelectedItem.getBindingContext("skillsModel").getObject();
            });
            this.aSelectedSkills = aSelectedData;
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
        
        // add employee skills
        onAddSkillsCreate: async function () {
            const oView = this.getView();
            const oEmployeeIdInput = oView.byId("inEmployeeIdEdit").getValue();

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
            var oTable = this.getView().byId("listEmployeeEdit");
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

        onCloseDialog: function (){
            this.getView().byId("idSkillDialog").close();
        },

        onCancel: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            var oEmployeeIdInput = this.getView().byId("inEmployeeIdEdit").getValue();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteDetailList", {
                    EmployeeID: oEmployeeIdInput
                });
            }
        }         
    });
});