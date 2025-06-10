sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], (Controller, Filter, FilterOperator, MessageBox, MessageToast) => {
    "use strict";
 
    return Controller.extend("sapips.training.employeeapp.controller.EmployeeList", {
        onInit() {},
 
        onUpdateFinished: function (oEvent) {
            var iTotalItems = oEvent.getParameter("total");
            var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            var sText = oResourceBundle.getText("employeeCountText", [iTotalItems]);
            this.byId("employeeCountText").setText(sText);
        },
       // Search function: initially, we used livechange, but, in the end, we decided to use search so that the user can see the 
       // results query after hitting enter.
        onSearch: function (oEvent) {
            // 1. Get the search query from the event parameter.
            const sQuery = oEvent.getParameter("query");
      
            // 2. Get a reference to the table and its binding.
            const oTable = this.byId("employeeTable");
            const oBinding = oTable.getBinding("items");
      
            // 3. If a search query exists, create and apply the filters.
            if (sQuery) {
              // We want to find employees where the FirstName OR the LastName contains the query.
              const oFilter = new Filter({
                filters: [
                  // Filter for the FirstName property
                  new Filter("FirstName", FilterOperator.Contains, sQuery),
                  // Filter for the LastName property
                  new Filter("LastName", FilterOperator.Contains, sQuery)
                  // similarly, we can put the diff filter keys by adding 
                  //new Filter("<fieldName>", FilterOperator.Contains, sQuery)
                ],
                and: false // Use 'false' for an OR condition between the filters
              });
      
              // Apply the filter to the binding.
              oBinding.filter([oFilter]);
            } else {
              // 4. If the search query is empty, remove all filters by passing an empty array.
              oBinding.filter([]);
            }
          },
 
        onAddEmployee: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteAddEmployee");
        },
       
        /**
         * Handles the deletion of selected employee from the table
         * Implements requirements from Page 12 of specifications:
         * - Must have at least one row selected
         * - Must show confirmation dialog before deletion ***
         * - Must perform actual deletion after confirmation 
         */        
        onDeleteEmployee: function () {
            //get the reference to the employee table
            var oTable = this.byId("employeeTable");
            //get the selected item: 
            var aSelectedItems = oTable.getSelectedItems();
            //get i18n resource bundle: 
            var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            //get the data model instance: 
            var oModel = this.getOwnerComponent().getModel();
 
            // Requirement (Page 12): Validate that at least 1 row is selected.
            if (aSelectedItems.length === 0) {
                MessageBox.warning(oResourceBundle.getText("deleteNoSelectionMessage"));
                return;
            }
 
            // Requirement (Page 12): Show a confirmation message.
            MessageBox.confirm(oResourceBundle.getText("deleteConfirmationMessage"), {
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        //if the user clicked on Yes, the function _fnPerformDelete will be called passing the selected item its corresponding data model.
                        this._fnPerformDelete(aSelectedItems, oModel);
                    }
                }
            });
        },

        // the actual deletion is inside this function: 
        _fnPerformDelete: function (aSelectedItems, oModel) {
            // loops trhough each selected item in the table
            aSelectedItems.forEach(function(oItem) {
                // gets the employee data object 
                const oSkillData = oItem.getBindingContext().getObject();
                // debugging purposes only. can be removed if needed.
                console.log(oSkillData);
                // extracts the EmployeeID -which is a primary key, from the data.
                const sEmployeeId = oSkillData.EmployeeID;    
                // validation: 
                if (!sEmployeeId) {
                    // for debugging purposes only. can be deleted. 
                    // console.error("Could not find key values for a selected employee.", oSkillData);
                    return; 
                }

                //else, prepare the odata for deletion parameters
                let sEntitySetName = "Employee"; 
                // create the odata path with key parameters
                const sPath = oModel.createKey("/" + sEntitySetName, {
                    EmployeeID: sEmployeeId, // Key property name must match metadata
                });                         
               // deletion execution: passing the sPath to execute the odata DELETE request.
                oModel.remove(sPath, {
                    success: function() {
                        MessageToast.show("Employee deleted successfully.");
                    },
                    // error handling 
                    error: function(oError) {
                        MessageBox.error("Failed to delete Employee. The server responded with an error.");
                        console.error("Error deleting item at path: " + sPath, oError);
                    }
                });
            });
        },        
        //MRM end
        onEmployeePress: function (oEvent) {
            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext();
            var sEmployeeID = oContext.getProperty("EmployeeID");
         
            this.getOwnerComponent().getRouter().navTo("RouteDetailList", {
              EmployeeID: sEmployeeID
            });
        }
    });
});