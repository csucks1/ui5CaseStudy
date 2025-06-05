sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], (Controller, MessageToast) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.DetailList", {
        onInit() {            
            const oRouter = this.getOwnerComponent().getRouter();
            const oRoute = oRouter.getRoute("RouteDetailList");
            oRoute.attachPatternMatched(this._onObjectMatched, this);           
        },

        _onObjectMatched: function (oEvent) {
            const oArguments = oEvent.getParameter("arguments");
            const sEmployeeID = oArguments.EmployeeID;

            if (sEmployeeID) {
                this._sEmployeeId = sEmployeeID;
                console.log("Detail view loaded for employeeId:", sEmployeeID);

                const sPath = "/Employee('" + sEmployeeID + "')";
                this.getView().bindElement({ path: sPath });
            } else {
                MessageToast.show("Employee ID not found.");
                console.error("DetailList: EmployeeID not found in route arguments.", oArguments);
            }

        },

        onEditPress: function () {
            if (this._sEmployeeId) { 
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteEditEmployee", {
                    query: {
                        employeeId: this._sEmployeeId,
                        isEdit: true
                    }
                });
            } else {
                MessageToast.show("Cannot edit: Employee ID is not available.");
                console.error("onEditPress: _sEmployeeId is not set. Cannot navigate to edit.");
            }
        },

        onNavBack: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteEmployeeList"); 
        }
                
    });
});