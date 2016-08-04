// define a root UIComponent which exposes the main view
/*global jQuery, sap */
jQuery.sap.declare("cp.templates.FreestylePage.Component");
jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.core.routing.Router");

// new Component
sap.ui.core.UIComponent.extend("cp.templates.FreestylePage.Component", {

    oMainView: null,

    // use inline declaration instead of component.json to save 1 round trip
    metadata: {
        includes: ["../../css/main.css"],
        dependencies: {
            libs: [ "sap.m" ],
            components: []
        },

        "config": {
            fullWidth: true,
            hideLightBackground: true
        }
    },

    createContent: function () {
        "use strict";
        this.oMainView = sap.ui.view({
            type: sap.ui.core.mvc.ViewType.XML,
            viewName: "cp.templates.FreestylePage.Template",
            id: this.createId("MainView")
        });
        return this.oMainView;
    }
});
