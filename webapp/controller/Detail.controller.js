sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller, JSONModel, MessageToast) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.DetailList", {

        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetailList").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            const employeeId = oEvent.getParameter("arguments").employeeId;

            const oModel = this.getOwnerComponent().getModel("employeeData");

            if (!oModel) {
                console.error("employeeData model is not available.");
                return;
            }

            const employeeList = oModel.getProperty("/Employee");

            if (Array.isArray(employeeList)) {
                const employeeData = employeeList.find(emp => emp.EmployeeID === employeeId);

                if (employeeData) {
                    // Set the detail data to a new JSONModel for binding
                    const oEmployeeModel = new JSONModel(employeeData);
                    this.getView().setModel(oEmployeeModel, "employeeModel");

                    // Set title manually (if needed)
                    this.getView().byId("detailPage").setTitle(employeeData.FirstName + " " + employeeData.LastName);
                } else {
                    console.log("Employee not found.");
                }
            } else {
                console.error("Employee list is not an array:", employeeList);
            }

        },

        _getEmployeeDataById: function (oModel, employeeId) {
            let employeeList = oModel.getProperty("/Employee");

            // Find employee by employeeId
            let employee = employeeList && employeeList.find(emp => emp.EmployeeID === employeeId);

            return employee;
        },

        onBack: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteEmployeeList");  // Adjust if the route name is different
        },

        onEditEmployee: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteEditEmployee", {
                employeeId: this.getView().getModel("employeeModel").getProperty("/EmployeeID")
            });
        },

        onCancel: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteEmployeeList");
        }

    });
});