sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], (Controller, MessageToast, History) => {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.BaseController", {

        /**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

        /**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
        getResourceBundle() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

        /**
         * Generic handler for opening the skill dialog.
         * Assumes the fragment is named "SkillDialog".
         */
        onAddItem: function() {
            if (!this.oDialog) {
                this.oDialog = this.loadFragment({
                    name: "sapips.training.employeeapp.fragment.SkillDialog"
                });
            }
            this.oDialog.then(function(oDialog) {
                oDialog.open();
            });
        },

        /**
         * Generic handler for closing the skill dialog.
         * Assumes the dialog's ID is "idSkillDialog".
         */
        onCloseDialog: function() {
            // A null check prevents errors if the dialog is destroyed
            const oDialog = this.byId("idSkillDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        /**
         * Executes a generic OData CREATE request.
         * @param {object} oData The payload for the creation.
         * @param {string} sEntity The entity set path (e.g., "/Employee").
         * @returns {Promise} A promise that resolves on success and rejects on error.
         */
        _onCreateQuery: function(oData, sEntity) {
            return new Promise((resolve, reject) => {
                const oModel = this.getOwnerComponent().getModel();
                oModel.create(sEntity, oData, {
                    success: (data) => {
                        resolve(data);
                    },
                    error: (oError) => {
                        console.error(`Error creating entity in ${sEntity}:`, oError);
                        reject(oError);
                    }
                });
            });
        },

        /**
         * Executes a generic OData READ request.
         * @param {sap.ui.model.json.JSONModel} oTargetModel The JSON model to populate with results.
         * @param {sap.ui.model.Filter[]} aFilter The array of filters.
         * @param {string} sFilterUri The entity set path to read from (e.g., "/Skill").
         * @returns {Promise} A promise that resolves on success and rejects on error.
         */
        _onReadQuery: function(oTargetModel, aFilter, sFilterUri) {
            return new Promise((resolve, reject) => {
                const oModel = this.getOwnerComponent().getModel();
                oModel.read(sFilterUri, {
                    filters: aFilter,
                    success: (data) => {
                        if (oTargetModel) {
                            oTargetModel.setData(data.results);
                        }
                        resolve(data.results);
                    },
                    error: (oError) => {
                        console.error(`Error reading entity from ${sFilterUri}:`, oError);
                        reject(oError);
                    }
                });
            });
        },

        /**
         * Executes a generic OData UPDATE request.
         * @param {object} oData The payload for the update.
         * @param {string} sEntityPath The full path to the entity (e.g., "/Employee('123')").
         * @returns {Promise} A promise that resolves on success and rejects on error.
         */
        _onUpdateQuery: function(oData, sEntityPath) {
            return new Promise((resolve, reject) => {
                const oModel = this.getOwnerComponent().getModel();
                oModel.update(sEntityPath, oData, {
                    success: (data) => {
                        resolve(data);
                    },
                    error: (oError) => {
                        console.error(`Error updating entity at ${sEntityPath}:`, oError);
                        reject(oError);
                    }
                });
            });
        },

        /**
         * Performs the frontend and backend deletion of selected skills.
         * @param {sap.m.ListItemBase[]} aSelectedItems The items selected from the list.
         * @param {sap.ui.model.odata.v2.ODataModel} oModel The OData model instance.
         */
        _performDelete: function(aSelectedItems, oModel) {
            const oSkillsModel = this.getView().getModel("skillsModel");
            let aCurrentSkills = oSkillsModel.getData();

            const aSkillsToDelete = aSelectedItems.map(oItem => {
                return oItem.getBindingContext("skillsModel").getObject();
            });

            aSkillsToDelete.forEach(oSkillData => {
                const sPath = oModel.createKey("/Skill", {
                    EmployeeeId: oSkillData.EmployeeeId,
                    SkillId: oSkillData.SkillId
                });
                oModel.remove(sPath, {
                    /* success/error handlers are optional here as we optimistically update the UI */ });
            });

            const aSkillsToKeep = aCurrentSkills.filter(oExistingSkill => {
                return !aSkillsToDelete.find(oSkillToDelete =>
                    oSkillToDelete.EmployeeeId === oExistingSkill.EmployeeeId &&
                    oSkillToDelete.SkillId === oExistingSkill.SkillId
                );
            });

            oSkillsModel.setData(aSkillsToKeep);

            // *** LINE CHANGED TO USE I18N ***
            const sMessage = this.getResourceBundle().getText("skillsDeletedMsg", [aSkillsToDelete.length]);
            MessageToast.show(sMessage);
        },

        /**
         * Navigates back in the browser history if possible, otherwise falls back to a default route.
         * @param {string} sFallbackRoute The name of the route to navigate to if no history is available.
         * @param {object} oFallbackParams Optional parameters for the fallback route.
         */
        _navigateBack: function(sFallbackRoute, oFallbackParams = {}) {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo(sFallbackRoute, oFallbackParams, true);
            }
        }
    });
});