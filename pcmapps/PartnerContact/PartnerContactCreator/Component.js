sap.ui.define(["sap/ui/core/UIComponent"], function(UIComponent) {
	return UIComponent.extend("c4c.create-PartnerContactCollection.local.Component", {
		metadata: {
			manifest: "json"
		},

		configuration: {
			componentName: "/PartnerContact/PartnerContactCreator",
			applicationPath: "/pcmapps",
			fioriPrefix: "/sap/fiori",
			appServiceSuffix: "/sap/c4c/odata/v1/pcmportal",

			businessObject: {
				targetEntity: "PartnerContactCollection",
				semanticObject: "PartnerContact"
			}
		},

		utils: {
			getQueryById: function(eQueryId, queries) {
				var i;
				var queryId = eQueryId || "defaultQuery";

				for (i = 0; i < queries.length; i++) {
					if (queryId === queries[i].id) {
						return queries[i];
					}
				}
			},

			revertArrayToFiltersArray: function(filters) {
				if (filters === undefined || filters === null || filters.length === 0) {
					return [];
				}
				var tableFilters = [];
				var i, filterLength, filterInstance;
				var modelFilter = null;
				filterLength = filters.length;
				for (i = 0; i < filterLength; i++) {
					filterInstance = filters[i];
					modelFilter = new sap.ui.model.Filter(filterInstance.key, filterInstance.operator, filterInstance.value);
					tableFilters.push(modelFilter);
				}
				return tableFilters;
			}
		},

		init: function() {

			//include more resources that are used by the widgets.
			this.setConfiguration();
			var oModel = new sap.ui.model.resource.ResourceModel({
				bundleName: "c4c.locale/annotations/bundle",
				bundleLocale: sap.m.getLocale().sLocaleId
			});

			this.setModel(oModel, "i18n");
			var oStaticModel = new sap.ui.model.resource.ResourceModel({
				bundleName: "c4c.locale/static/bundle/messages",
				bundleLocale: sap.m.getLocale().sLocaleId
			});

			this.setModel(oStaticModel, "i18n_Static");
			UIComponent.prototype.init.call(this);

		},
		destroy: function() {
			// call overriden destroy
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		setConfiguration: function() {

			this.configuration.appName = this.configuration.fioriPrefix + this.configuration.applicationPath + this.configuration.componentName;
			this.configuration.pathToDestination = this.configuration.fioriPrefix + this.configuration.applicationPath + "/";

			try {
				if (sap.ushell && sap.ushell.services && sap.ushell.services.AppConfiguration) {
					this.configuration.appService = "c4c" + this.configuration.appServiceSuffix;
					this.configuration.businessObject.oDataService = "c4c" + this.configuration.appServiceSuffix;
					jQuery.sap.registerModulePath("c4c.locale", this.configuration.pathToDestination + "i18n");
					jQuery.sap.registerModulePath("c4c.create-PartnerContactCollection.local", this.configuration.appName);
					jQuery.sap.registerModulePath("c4c.create-PartnerContactCollection.remote", this.configuration.appName);
				} else {
					this.configuration.appService = "c4cPreview" + this.configuration.appServiceSuffix;
					this.configuration.businessObject.oDataService = "c4cPreview" + this.configuration.appServiceSuffix;
				}
			} catch (e) {
				this.configuration.appService = "c4cPreview" + this.configuration.appServiceSuffix;
				this.configuration.businessObject.oDataService = "c4cPreview" + this.configuration.appServiceSuffix;
			}
			window.generalNameSpace = this.configuration;
			window.generalNameSpace.utils = this.utils;
		},
		createContent: function() {
			var targetEntity = this.configuration.businessObject.targetEntity;
			var view = sap.ui.view({
				viewName: "c4c.create-PartnerContactCollection.local.view.create",
				type: sap.ui.core.mvc.ViewType.XML,
				viewData: {
					targetEntity: targetEntity
				}
			});
			return view;
		}
	});
});