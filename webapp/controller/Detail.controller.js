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
            // Get all arguments passed to the route
            const oArguments = oEvent.getParameter("arguments");

            // Query parameters are nested under a "?query" key within the arguments
            const oQueryParameters = oArguments["?query"];

            if (oQueryParameters && oQueryParameters.employeeId) {
                this._sEmployeeId = oQueryParameters.employeeId; // Store the employeeId
                console.log("Detail view loaded for employeeId:", this._sEmployeeId);

                // Optional: If your view needs to be bound to a specific OData path
                // based on this employeeId, you would do it here. For example:
                // const sPath = `/YourEntitySet('${this._sEmployeeId}')`;
                // this.getView().bindElement({ path: sPath });

            } else {
                // Handle the case where employeeId is not passed
                MessageToast.show("Employee ID not found in URL parameters.");
                console.error("DetailList: employeeId not found in query parameters.", oArguments);
                // Optionally navigate back or to an error page
                // this.getOwnerComponent().getRouter().navTo("RouteOverview", {}, true);
            }
        },

        onEditPress: function () {
            if (this._sEmployeeId) { // Check if we have an employeeId
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteEditEmployee", {
                    // Pass the currently viewed employeeId as a query parameter
                    // to the AddEmployee route
                    query: {
                        employeeId: this._sEmployeeId,
                        isEdit: true
                    }
                });
            } else {
                MessageToast.show("Cannot edit: Employee ID is not available.");
                console.error("onEditPress: _sEmployeeId is not set. Cannot navigate to edit.");
            }
        }
                
    });
});