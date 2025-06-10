sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, Filter, FilterOperator, JSONModel) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.DetailList", {
        onInit() {
            const oRouter = this.getOwnerComponent().getRouter();
            const oRoute = oRouter.getRoute("RouteDetailList");
            this.getView().setModel(new JSONModel([]), "skillsModel");

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

                // filter skills 
                const oView = this.getView();
                const oSkillsModel = oView.getModel("skillsModel");
                var oModel = this.getOwnerComponent().getModel();

                var aFilter = [];
                aFilter.push(new Filter({
                    path: "EmployeeeId",
                    operator: FilterOperator.EQ,
                    value1: sEmployeeID
                }));

                var sFilterUri = "/Skill"

                oModel.read(sFilterUri, {
                    filters: aFilter,
                    success: function (data) {
                        var aData = data.results;
                        if (oSkillsModel) {
                            oSkillsModel.setData(aData);
                        }
                        //Declare the counting of Skills
                        const iSkillCount = aData.length;

                        // Access the tab and update its text
                        const oSkillsTab = oView.byId("idTabSkills");

                        // Get the i18n text for "skills"
                        const oResourceBundle = oView.getModel("i18n").getResourceBundle();
                        const sSkillsText = oResourceBundle.getText("skills"); // e.g., "Skills"

                        // Update tab text to "Skills (X)"
                        if (oSkillsTab) {
                            oSkillsTab.setText(`${sSkillsText} (${iSkillCount})`);
                        }
                    },
                    error: function (data) {
                        console.error("something wrong employee", data);
                    }
                })
            } else {
                MessageToast.show("Employee ID not found.");
                console.error("DetailList: EmployeeID not found in route arguments.", oArguments);
            }

        },

        onEditPress: function (oEvent) {
            if (this._sEmployeeId) {
                var oSelectedItem = oEvent.getSource();
                var oContext = oSelectedItem.getBindingContext();
                var sEmployeeID = oContext.getProperty("EmployeeID");

                this.getOwnerComponent().getRouter().navTo("RouteEditEmployee", {
                    EmployeeID: sEmployeeID
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