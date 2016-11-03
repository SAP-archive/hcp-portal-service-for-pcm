sap.ui.define(["sap/ui/core/UIComponent"], function(UIComponent){
    /*global jQuery , sap*/
    return UIComponent.extend("registrationview.local.Component", {

        metadata: {
            manifest: "json"
        },
        init: function() {
            UIComponent.prototype.init.call(this);
            this.initResourceBundle();
            this.attachEvent("open.dialog", this.onSettings.bind(this));
            this.initRegistrationDataModel();
        },

        onConfigChange: function() {
            var manifest = this.getMetadata().getManifest();
            if (manifest["sap.cloud.portal"].settings) {
                var settings = manifest["sap.cloud.portal"].settings;
                this.onSettingsModelChange(settings);
            }
        },

        resetRegistrationDataModel: function() {
            var registrationDataModel = this.getModel("registrationDataModel");
            registrationDataModel.setData({
                postData: {
                    candidateFirstName: "",
                    candidateLastName: "",
                    mail: ""
                }, callback: {
                    displayMessage: false,
                    status: "None",
                    msg: "",
                    showFields: true
                }
            });
        },
        initRegistrationDataModel: function() {
            var registrationDataModel = new sap.ui.model.json.JSONModel();
            registrationDataModel.setData({
                postData: {
                    candidateFirstName: "",
                    candidateLastName: "",
                    mail: ""
                }, callback: {
                    displayMessage: false,
                    status: "None",
                    msg: "",
                    showFields: true
                },
                requestSent: true
            });
            this.setModel(registrationDataModel, "registrationDataModel");
        },

        initResourceBundle: function() {
            var oI18nAppModel = this.view.getModel("i18nApp").getResourceBundle();
            this.oBundle = oI18nAppModel;
        },

        destroy: function() {
            var settingsModel = this.getModel("settings");
            if (settingsModel) {
                settingsModel.destroy();
            }
            // call overriden destroy
            UIComponent.prototype.destroy.apply(this, arguments);
        },

        onSettingsModelChange: function(settigs) {
            var settingsModel = this.getModel("settings");
            if (settingsModel){
                settingsModel.setData(settigs);
                return;
            }

            var model = new sap.ui.model.json.JSONModel(settigs);
            this.setModel(model, "settings");
        },

        getSiteId: function() {
            var siteService = sap.ushell.Container.getService("SiteService");
            return siteService.getSiteID();
        },

        onSettings: function() {
            var ctrl = this.view.getController();
            ctrl.openDialog();
        },

        createContent: function() {
            this.view = sap.ui.view({
                viewName: "registrationview.local.view.RegistrationView",
                type: sap.ui.core.mvc.ViewType.XML,
                async: true
            });

            return this.view;
        }
    });
});
