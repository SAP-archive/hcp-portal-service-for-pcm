(function () {
	"use strict";
	/*global jQuery, sap*/


jQuery.sap.declare("c4c.manage-invitations.local.Component");
sap.ui.core.UIComponent.extend("c4c.manage-invitations.local.Component", {
	metadata: {
		manifest: "json"
	},
	createContent: function() {

		// create root view
		var oView = sap.ui.view({
			id: "app",
			viewName: "c4c.manage-invitations.local.view.App",
			type: "JS",
			viewData: { component: this }
		});
		try {
            if (sap.ushell && sap.ushell.services && sap.ushell.services.AppConfiguration){
               jQuery.sap.registerModulePath("c4c.manage-invitations.local", "/sap/fiori/pcmcpapps/Invite");
            }
		} catch(err){
		}
		return oView;
	}});
}());
