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