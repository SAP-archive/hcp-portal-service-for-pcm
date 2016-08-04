sap.ui.define(["sap/ui/core/UIComponent"], function(UIComponent) {
	return UIComponent.extend("c4c.details-taskcollection.local.Component", {
		metadata: {
			manifest: "json"
		},

		configuration: {
			componentName: "/Task/TaskDetails",
			applicationPath: "/pcmapps",
			fioriPrefix: "/sap/fiori",
			appServiceSuffix: "/sap/c4c/odata/v1/pcmportal",
			businessObject: {
				semanticObject: "Task",
				targetEntity: "TaskCollection"
			}
		},

		isFlp: false,
		init: function() {
			//include more resources that are used by the widgets.
			this.setModulePath();
			this.oModel = new sap.ui.model.resource.ResourceModel({
				bundleName: "c4c.locale/annotations/bundle",
				bundleLocale: sap.m.getLocale().sLocaleId
			});
			this.oStaticModel = new sap.ui.model.resource.ResourceModel({
				bundleName: "c4c.locale/static/bundle/messages",
				bundleLocale: sap.m.getLocale().sLocaleId
			});
			this.oAnnotationExtModel = new sap.ui.model.resource.ResourceModel({
				bundleName: "c4c.locale/annotationsExtension/messages",
				bundleLocale: sap.m.getLocale().sLocaleId
			});
			this.setModel(this.oModel, "i18n");
			this.setModel(this.oStaticModel, "i18n_Static");
			this.setModel(this.oAnnotationExtModel, "i18n_AnnoExt");
			UIComponent.prototype.init.call(this);

		},
		destroy: function() {
			// call overriden destroy
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		setModulePath: function() {
			this.configuration.appName = this.configuration.fioriPrefix + this.configuration.applicationPath + this.configuration.componentName;
			this.configuration.pathToDestination = this.configuration.fioriPrefix + this.configuration.applicationPath + "/";

			try {
				if (sap.ushell && sap.ushell.services && sap.ushell.services.AppConfiguration) {
					this.isFlp = true;
					this.configuration.businessObject.oDataService = "c4c" + this.configuration.appServiceSuffix;
					jQuery.sap.registerModulePath("c4c.locale", this.configuration.pathToDestination + "i18n");
					jQuery.sap.registerModulePath("c4c.details-taskcollection.local", this.configuration.appName);
				} else {
					this.configuration.businessObject.oDataService = "c4cPreview" + this.configuration.appServiceSuffix;
				}
			} catch (e) {
				//preview mode in some cases
				this.configuration.businessObject.oDataService = "c4cPreview" + this.configuration.appServiceSuffix;
			}
			this.configuration.appService = this.configuration.businessObject.oDataService;

			window.generalNameSpace = this.configuration;
		},
		createContent: function() {
			var params = this.receiveStartupParams();
			var view = sap.ui.view({
				viewName: "c4c.details-taskcollection.local.view.details",
				type: sap.ui.core.mvc.ViewType.XML,
				viewData: params
			});
			return view;
		},

		receiveStartupParams: function() {
			var obj = {};
			if (this.isFlp) {
				var oComponentData = this.getComponentData && this.getComponentData();
				if (oComponentData && oComponentData.startupParameters) {
					var startupParameters = oComponentData.startupParameters;
					obj.id = startupParameters.objectId && startupParameters.objectId[0];
					obj.functionImport = startupParameters.functionImport && startupParameters.functionImport[0];
				}
			}
			return obj;
		}
	});
});