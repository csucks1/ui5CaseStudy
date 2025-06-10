sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], (Controller, Filter, FilterOperator, MessageBox, MessageToast) => {
    "use strict";
 
    return Controller.extend("sapips.training.employeeapp.controller.EmployeeList", {
        onInit() {
            // Best practice to get the resource bundle once and store it.
            this._oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
 
        onUpdateFinished: function (oEvent) {
            var iTotalItems = oEvent.getParameter("total");
            // Use the stored resource bundle property.
            var sText = this._oResourceBundle.getText("employeeCountText", [iTotalItems]);
            this.byId("employeeCountText").setText(sText);
        },
       
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
       
        onDeleteEmployee: function () {
            var oTable = this.byId("employeeTable");
            var aSelectedItems = oTable.getSelectedItems();
            var oModel = this.getOwnerComponent().getModel();
 
            // Requirement (Page 12): Validate that at least 1 row is selected.
            if (aSelectedItems.length === 0) {
                // Use the i18n key for the warning message.
                MessageBox.warning(this._oResourceBundle.getText("deleteNoSelectionMessage"));
                return;
            }
 
            // Requirement (Page 12): Show a confirmation message.
            // Use the i18n keys for both the message text and the dialog title.
            MessageBox.confirm(this._oResourceBundle.getText("deleteConfirmationMessage"), {
                title: this._oResourceBundle.getText("confirmDeletionTitle"),
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        this._fnPerformDelete(aSelectedItems, oModel);
                    }
                }
            });
        },

        _fnPerformDelete: function (aSelectedItems, oModel) {
            // ADDED: Create a local reference to the resource bundle for use inside forEach.
            const oResourceBundle = this._oResourceBundle;

            aSelectedItems.forEach(function(oItem) {
                const oSkillData = oItem.getBindingContext().getObject();
                console.log(oSkillData);
                const sEmployeeId = oSkillData.EmployeeID;    
        
                if (!sEmployeeId) {
                    console.error("Could not find key values for a selected skill. Please check property names.", oSkillData);
                    return; 
                }

                let sEntitySetName = "Employee"; 
                const sPath = oModel.createKey("/" + sEntitySetName, {
                    EmployeeID: sEmployeeId, // Key property name must match metadata
                });                         
               
                oModel.remove(sPath, {
                    success: function() {
                        // CHANGED: Replaced hardcoded string with i18n key.
                        MessageToast.show(oResourceBundle.getText("employeeDeleteSuccessMsg"));
                    },
                    error: function(oError) {
                        // CHANGED: Replaced hardcoded string with i18n key.
                        MessageBox.error(oResourceBundle.getText("employeeDeleteErrorMsg"));
                        console.error("Error deleting item at path: " + sPath, oError);
                    }
                });
            });
        },        
 
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