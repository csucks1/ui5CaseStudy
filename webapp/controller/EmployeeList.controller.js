sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
], (Controller, MessageToast) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.EmployeeList", {
        onInit() {
        },

        onAddEmployee: function (){
            var oRouter = this.getOwnerComponent().getRouter();        
            oRouter.navTo("RouteAddEmployee");
        },

        onEmployeePress: function (oEvent) {
            // Get the employeeId from the binding context of the selected item
            let employeeId = oEvent.getSource().getBindingContext().getObject().EmployeeID
            let oRouter = this.getOwnerComponent().getRouter();    
            
            // Navigate to the Detail route with the employeeId as a parameter
            oRouter.navTo("RouteDetailList", {
                //query: {
                //    employeeId: employeeId
                //}
                employeeId: employeeId // Pass employeeId as a route parameter, not inside query
            });
        }
    });
});