sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], (Controller, Filter, FilterOperator, MessageBox) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.EmployeeList", {
        onInit() {},

        onUpdateFinished: function (oEvent) {
            var iTotalItems = oEvent.getParameter("total");
            var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            var sText = oResourceBundle.getText("employeeCountText", [iTotalItems]);
            this.byId("employeeCountText").setText(sText);
        },
        
        onSearch: function (oEvent) {
            // Get the search query from the event.
            var sQuery = oEvent.getParameter("query");
            var aFilters = [];

            // If the query is not empty, create a filter.
            if (sQuery) {
                // As per Page 10, we filter on multiple fields.
                aFilters.push(new Filter({
                    filters: [
                        new Filter("FirstName", FilterOperator.Contains, sQuery),
                        new Filter("LastName", FilterOperator.Contains, sQuery),
                        new Filter("EmployeeID", FilterOperator.Contains, sQuery)
                    ],
                    and: false // Use OR logic for the filters
                }));
            }

            // Get the table and its item binding.
            var oTable = this.byId("employeeTable");
            var oBinding = oTable.getBinding("items");
            
            // Apply the filter to the binding.
            oBinding.filter(aFilters);
        },

        onAddEmployee: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteAddEmployee");
        },
        
        onDeleteEmployee: function () {
            var oTable = this.byId("employeeTable");
            var aSelectedItems = oTable.getSelectedItems();
            var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            // Requirement (Page 12): Validate that at least 1 row is selected.
            if (aSelectedItems.length === 0) {
                MessageBox.warning(oResourceBundle.getText("deleteNoSelectionMessage"));
                return;
            }

            // Requirement (Page 12): Show a confirmation message.
            MessageBox.confirm(oResourceBundle.getText("deleteConfirmationMessage"), {
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        // Logic to delete the items would go here.
                        // For a mock server, we can simulate this.
                        console.log("Deletion confirmed for " + aSelectedItems.length + " items.");
                        // In a real app, you would get the binding context of each item
                        // and call `oModel.remove()` for each selected path.
                    }
                }
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