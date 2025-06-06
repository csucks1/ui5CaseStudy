sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
], (Controller, MessageToast) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.EmployeeList", {
        onInit() {
        },

        /**
         * This function is called every time the table's items are updated.
         * It updates the title of the table with the number of employees.
         * @param {sap.ui.base.Event} oEvent The update finished event
         */
        onUpdateFinished: function (oEvent) {
            // Get the total number of items in the table's binding
            var iTotalItems = oEvent.getParameter("total");
            
            // Get the i18n model's resource bundle
            var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            
            // Get the text from the i18n properties file, replacing the placeholder {0} with the total item count
            var sText = oResourceBundle.getText("employeeCountText", [iTotalItems]);
            
            // Find the Text control by its ID and set the updated text
            this.byId("employeeCountText").setText(sText);
        },

        onAddEmployee: function (){
            var oRouter = this.getOwnerComponent().getRouter();        
            oRouter.navTo("RouteAddEmployee");
        },

        onEmployeePress: function (oEvent) {
            let employeeId = oEvent.getSource().getBindingContext().getObject().EmployeeID
            var oRouter = this.getOwnerComponent().getRouter();        
            oRouter.navTo("RouteDetailList", {
                query: {
                    employeeId: employeeId
                }
            });
        }
    });
});