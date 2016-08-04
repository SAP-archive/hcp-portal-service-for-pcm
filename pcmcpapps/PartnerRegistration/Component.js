(function () {
	"use strict";
	/*global jQuery, sap, window, parent*/
	jQuery.sap.declare("c4c.registration.local.Component");
	sap.ui.core.UIComponent.extend("c4c.registration.local.Component", {
		metadata: {
			manifest: "json"
		},

		configuration: {
			appName: "/sap/fiori/pcmcpapps/PartnerRegistration",
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
					jQuery.sap.registerModulePath("c4c.registration.local",this.configuration.appName);
					jQuery.sap.registerModulePath("c4c.registration.remote", this.configuration.appName);

				}
			}catch(e){
				//preview mode in some cases
			}

			window.generalNameSpace = this.configuration;
		},

		createContent: function () {
			// create root view
			var oView = sap.ui.view({
				id: "appRegistrationView",
				viewName: "c4c.registration.local.view.App",
				type: "XML",
				viewData: {component: this}
			});
			return oView;
		}
	});
}());
