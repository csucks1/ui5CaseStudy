sap.ui.define([
    "sap/ui/core/UIComponent",
    "sapips/training/employeeapp/model/models",
    "sap/ui/model/json/JSONModel"
], (UIComponent, models, JSONModel) => {
    "use strict";

    return UIComponent.extend("sapips.training.employeeapp.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // Load the Employee.json data
            const oEmployeeModel = new JSONModel();
            oEmployeeModel.loadData("localService/mainService/data/Employee.json");

            // Set it as employeeData
            this.setModel(oEmployeeModel, "employeeData");

            // enable routing
            this.getRouter().initialize();
        }
    });
});