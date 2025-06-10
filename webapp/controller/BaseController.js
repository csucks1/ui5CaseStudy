sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "sap/ui/core/library",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], (Controller, MessageToast, History, library, MessageBox, Filter, FilterOperator) => {
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
        },

        /**
         * Handles the creation or update of a skill for an employee.
         * @param {string} sEmployeeInputId The ID of the input field holding the Employee ID.
         */
        onAddSkills: async function(sEmployeeInputId) {
            // this code gets references to the view, models, and resource bundle
            const oView = this.getView();
            const oResourceBundle = this.getResourceBundle();
            const oSkillsModel = oView.getModel("skillsModel");
            const oModel = this.getOwnerComponent().getModel();
            
            // this code gets the current Employee ID using the provided parameter
            const sEmployeeId = oView.byId(sEmployeeInputId).getValue();

            // this code gets values and keys from the Skill and Proficiency ComboBoxes in the Fragment
            const oSkill = this.byId("inSkillList");
            const sValueSkill = oSkill.getValue();
            const sSelectedKeySkill = oSkill.getSelectedKey();
            const oProficient = this.byId("inSProficient");
            const sValueProficient = oProficient.getValue();
            const sSelectedKeyProficient = oProficient.getSelectedKey();

            // this code validates that an item was selected from the suggestion lists
            if ((sValueSkill !== "" && sSelectedKeySkill === "") || (sValueProficient !== "" && sSelectedKeyProficient === "")) {
                MessageToast.show(oResourceBundle.getText("invalidListEntry"));
                return;
            }
            
            // this code gets the current list of skills from the local JSON model
            const aCurrentSkills = oSkillsModel.getData();
            // this code checks if the skill being added already exists in the local list
            const oExistingSkill = aCurrentSkills.find(skill => skill.SkillId === sSelectedKeySkill);

            try {
                // this code executes if the skill already exists, triggering an update
                if (oExistingSkill) {
                    // this code checks if the proficiency level has actually changed to avoid unnecessary updates
                    if (oExistingSkill.ProficiencyID === sSelectedKeyProficient) {
                        MessageToast.show(oResourceBundle.getText("skillNoChanges", [sValueSkill])); // "No changes made to skill."
                        this.onCloseDialog();
                        return;
                    }

                    // this code creates the OData path for the specific skill to be updated
                    const sPath = oModel.createKey("/Skill", {
                        EmployeeeId: sEmployeeId, // Using the 3 'e's as requested
                        SkillId: sSelectedKeySkill
                    });
                    // this code prepares the payload with only the fields to be updated
                    const oUpdateData = {
                        ProficiencyID: sSelectedKeyProficient,
                        ProficiencyLevel: sValueProficient
                    };

                    // this code calls the generic update function from the BaseController
                    await this._onUpdateQuery(oUpdateData, sPath);
                    MessageToast.show(oResourceBundle.getText("skillUpdateSuccess"));

                } else { // this code executes if the skill is new, triggering a creation
                    // this code prepares the full data payload for the new skill
                    const oData = {
                        EmployeeeId: sEmployeeId, // Using the 3 'e's as requested
                        SkillId: sSelectedKeySkill,
                        ProficiencyID: sSelectedKeyProficient,
                        SkillName: sValueSkill,
                        ProficiencyLevel: sValueProficient
                    };

                    // this code calls the generic create function for the "/Skill" entity set
                    await this._onCreateQuery(oData, "/Skill");
                    MessageToast.show(oResourceBundle.getText("skillCreateSuccess"));
                }

                // this code now runs after a successful create OR update
                // this code creates a filter to fetch all skills for the current employee
                const aFilter = [new Filter("EmployeeeId", FilterOperator.EQ, sEmployeeId)]; // Using the 3 'e's as requested
                // this code re-reads the skills from the backend to ensure the local list is up-to-date
                await this._onReadQuery(oSkillsModel, aFilter, "/Skill");
                // this code closes the skill dialog
                this.onCloseDialog();

            } catch (oError) {
                // this code shows a generic error message if the create or update fails
                MessageBox.error(oResourceBundle.getText("skillSaveError"));
            }
        }, 
        
        /**
         * Handles the deletion of selected skills from a given table.
         * @param {string} sTableId The ID of the sap.m.Table or sap.m.List control.
         */
        onDeleteSkill: function(sTableId) {
            // this code gets the resource bundle
            const oResourceBundle = this.getResourceBundle();
            // this code gets the table/list of skills using the provided ID
            const oTable = this.getView().byId(sTableId);
            // this code gets the items that the user has selected in the table
            const aSelectedItems = oTable.getSelectedItems();

            // this code checks if any item was selected
            if (aSelectedItems.length === 0) {
                // this code shows a message asking the user to select an item
                MessageToast.show(oResourceBundle.getText("selectSkillToDelete"));
                return; // this code stops execution
            }

            // this code shows a confirmation dialog to the user
            MessageBox.confirm(oResourceBundle.getText("confirmSkillDeletionMsg"), {
                title: oResourceBundle.getText("confirmDeletionTitle"),
                // this code is the callback function that runs after the user clicks an action
                onClose: (sAction) => {
                    // this code checks if the user clicked the "OK" button
                    if (sAction === MessageBox.Action.OK) {
                        // this code calls a helper function to perform the deletion
                        this._performDelete(aSelectedItems, this.getOwnerComponent().getModel());
                    }
                }
            });
        },   
        
        /**
         * Validates an input control to ensure it contains only alphabetic characters.
         * @param {string} sInputId The ID of the sap.m.Input control to validate.
         * @param {string} sErrorMessageKey The i18n key for the error message.
         */
        _validateAlpha: function(sInputId, sErrorMessageKey) {
            // this code gets the ValueState library for setting input states (e.g., Error, Success)
            const ValueState = library.ValueState;
            // this code gets the resource bundle for internationalization (i18n)
            const oResourceBundle = this.getResourceBundle();
            // this code gets a reference to the INPUT CONTROL OBJECT using the provided ID
            const oInput = this.byId(sInputId);
            
            if (!oInput) return; // a safety check

            // this code gets the VALUE from the control object for validation
            const sValue = oInput.getValue();
            // this code defines a regular expression to allow only alphabetic characters (and an empty string)
            const alphaRegex = /^[a-zA-Z]*$/;

            // this code tests the VALUE against the regex
            if (!alphaRegex.test(sValue)) {
                // this code sets the input's state to Error
                oInput.setValueState(ValueState.Error);
                // this code sets the error message text
                oInput.setValueStateText(oResourceBundle.getText(sErrorMessageKey));
            } else {
                // this code clears the error state if the input is valid
                oInput.setValueState(ValueState.None);
            }
        },

        /**
         * Validates a numeric input control to ensure it's within a given range.
         * @param {string} sInputId The ID of the sap.m.Input control to validate.
         * @param {string} sErrorMessageKey The i18n key for the error message.
         * @param {number} nMin The minimum allowed value.
         * @param {number} nMax The maximum allowed value.
         */
        _validateNumeric: function(sInputId, sErrorMessageKey, nMin, nMax) {
            const ValueState = library.ValueState;
            const oResourceBundle = this.getResourceBundle();
            const oInput = this.byId(sInputId);

            if (!oInput) return;
            
            const sValue = oInput.getValue();
            
            // An empty field is not an error during typing
            if (sValue) {
                const nValue = parseInt(sValue, 10);
                // this code checks if the value is not a number or is outside the valid range
                if (isNaN(nValue) || nValue < nMin || nValue > nMax) {
                    oInput.setValueState(ValueState.Error);
                    oInput.setValueStateText(oResourceBundle.getText(sErrorMessageKey));
                } else {
                    oInput.setValueState(ValueState.None);
                }
            } else {
                // this code clears the error state if the field is cleared by the user
                oInput.setValueState(ValueState.None);
            }
        },

        /**
         * Validates a ComboBox to ensure a valid item is selected.
         * @param {string} sComboBoxId The ID of the sap.m.ComboBox control.
         * @param {string} sErrorMessageKey The i18n key for the error message.
         */
        _validateComboBox: function(sComboBoxId, sErrorMessageKey) {
            const ValueState = library.ValueState;
            const oResourceBundle = this.getResourceBundle();
            const oComboBox = this.byId(sComboBoxId);
            
            if (!oComboBox) return;
            
            const sValue = oComboBox.getValue();
            const sSelectedKey = oComboBox.getSelectedKey();

            // this code checks if the user typed a value that is not in the suggestion list
            if (sValue !== "" && sSelectedKey === "") {
                oComboBox.setValueState(ValueState.Error);
                oComboBox.setValueStateText(oResourceBundle.getText(sErrorMessageKey));
            } else {
                oComboBox.setValueState(ValueState.None);
            }
        },        
    });
});