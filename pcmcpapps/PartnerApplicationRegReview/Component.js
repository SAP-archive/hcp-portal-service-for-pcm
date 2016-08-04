(function () {
    "use strict";
    /*global jQuery, sap, window, parent*/
jQuery.sap.declare("appReview.local.Component");
sap.ui.core.UIComponent.extend("appReview.local.Component", {
    metadata: {
        manifest: "json"
    },

    configuration: {
        appName: "/sap/fiori/pcmcpapps/PartnerApplicationRegReview",
        pathToDestination: "sap/fiori/pcmcpapps/",
        businessObject: {
            targetEntity: "PartnerOnboardingRequestCollection",
            oDataService: "c4c__public"
        }
    },

    init: function () {
        this.setModulePath();
        sap.ui.core.UIComponent.prototype.init.call(this);
    },

    destroy: function () {
        // call overriden destroy
        sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
    },

    setModulePath: function(){
        try {
            if (typeof parent.name !== "undefined" && parent.name !== "preview"){
                this.isFlp = true;
                jQuery.sap.registerModulePath("appReview.local",this.configuration.appName);
                jQuery.sap.registerModulePath("appReview.remote", this.configuration.appName);

            }
        }catch(e){
            //preview mode in some cases
        }

        window.generalNameSpace = this.configuration;
    },

    createContent: function () {
        // create root view
        var oView = sap.ui.view({
            id: "app",
            viewName: "appReview.local.view.App",
            type: "XML",
            viewData: {component: this}
        });

        return oView;
    }
});}());
