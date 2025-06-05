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
            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext();
            var sEmployeeID = oContext.getProperty("EmployeeID");
          
            this.getOwnerComponent().getRouter().navTo("RouteDetailList", {
              EmployeeID: sEmployeeID
            });
        }
    });
});