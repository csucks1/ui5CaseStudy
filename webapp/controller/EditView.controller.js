sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
], (Controller, MessageToast, Filter, FilterOperator, JSONModel, MessageBox) => {
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
        
        // edit employee
        onEdit: function () {
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
            var oEmployeeIdInput = this.getView().byId("inEmployeeIdEdit").getValue();
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
                        // User confirmed, proceed with deletion
                        try{
                            this._performDelete(aSelectedItems, oModel);
                            this._filterSkills(oEmployeeIdInput);
                        } catch (oError) {

                        }
                    }
                }.bind(this) // .bind(this) is crucial to keep the controller's context
            });
        },

        _performDelete: function (aSelectedItems, oModel, sPath) {
            aSelectedItems.forEach(function(oItem) {
                const oSkillData = oItem.getBindingContext("skillsModel").getObject();
        
                const sEmployeeId = oSkillData.EmployeeeId;
                const sSkillId = oSkillData.SkillId;       
        
                if (!sEmployeeId || !sSkillId) {
                    console.error("Could not find key values for a selected skill. Please check property names.", oSkillData);
                    return; 
                }
                // const sPath = "/Skill(EmployeeeId='" + sEmployeeId + "', SkillId='" + sSkillId + "')";
                const sPath = "/Skill(SkillId='" + sSkillId + "')";                
        
                // 4. Call the remove function with the constructed path
                oModel.remove(sPath, {
                    success: function() {
                        MessageToast.show("Skill deleted successfully.");
                    },
                    error: function(oError) {
                        MessageBox.error("Failed to delete skill. The server responded with an error.");
                        console.error("Error deleting item at path: " + sPath, oError);
                    }
                });
            });
        },
        
        onCloseDialog: function (){
            this.getView().byId("idSkillDialog").close();
        },
    });
});