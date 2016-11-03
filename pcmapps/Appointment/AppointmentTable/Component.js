sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/model/odata/ODataUtils"], function(UIComponent) {
	return UIComponent.extend("c4c.table-appointmentcollection.local.Component", {

		metadata: {
			manifest: "json"
		},

		configuration: {
			componentName: "/Appointment/AppointmentTable",
			applicationPath: "/pcmapps",
			fioriPrefix: "/sap/fiori",
			appServiceSuffix: "/sap/c4c/odata/v1/pcmportal",
			businessObject: {
				targetEntity: "AppointmentCollection",
				semanticObject: "Appointment",
				growingThreshold: 15,
				queries: [{
					name: "CHP.Appointment.UI.Query.UI.Filter.AllAppointments",
					type: "Parameter",
					isDefault: "true",
					filter: []
				}, {
					name: "CHP.Appointment.UI.Query.UI.Filter.MyOpenAppointments",
					funcName: "Get_My_Open_Appointments",
					type: "FunctionImport",
					isDefault: "false",
					filter: []
				}]
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
				return this.getDefaultQuery(queries);
			},

			getQueryByName: function(eQueryName, queries) {
				var i;
				if (!queries || queries === "undefined" || queries.length === 0) {
					return null;
				}
				var queryName = eQueryName || this.getDefaultQuery(queries).name;

				for (i = 0; i < queries.length; i++) {
					if (queryName === queries[i].name) {
						return queries[i];
					}
				}
				return this.getDefaultQuery(queries);
			},

			getDefaultQuery: function(queries) {
				var i;
				if (!queries) {
					return null;
				}
				for (i = 0; i < queries.length; i++) {
					if (queries[i].isDefault === "true") {
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
			},

			revertToFunctionImportFilter: function() {
				return "";
			}
		},

		init: function() {
			//include more resources that are used by the widgets.
			this.setModulePath();

			sap.ui.localResources("view");
			sap.ui.localResources("controller");
			this.oModel = new sap.ui.model.resource.ResourceModel({
				bundleName: "c4c.locale/annotations/bundle",
				bundleLocale: sap.m.getLocale().sLocaleId
			});
			this.setModel(this.oModel, "i18n");
			this.oStaticModel = new sap.ui.model.resource.ResourceModel({
				bundleName: "c4c.locale/static/bundle/messages",
				bundleLocale: sap.m.getLocale().sLocaleId
			});
			this.oAnnotationExtModel = new sap.ui.model.resource.ResourceModel({
				bundleName: "c4c.locale/annotationsExtension/messages",
				bundleLocale: sap.m.getLocale().sLocaleId
			});
			this.setModel(this.oStaticModel, "i18n_Static");
			this.setModel(this.oAnnotationExtModel, "i18n_AnnoExt");
			jQuery.sap.require("sap.ui.core.EventBus");
			sap.ui.core.UIComponent.prototype.init.call(this);

		},
		destroy: function() {
			// call overriden destroy
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		setModulePath: function() {
			this.configuration.appName = this.configuration.fioriPrefix + this.configuration.applicationPath + this.configuration.componentName;
			this.configuration.pathToDestination = this.configuration.fioriPrefix + this.configuration.applicationPath + "/";

			try {
				if (sap.ushell.services.AppConfiguration) {
					this.configuration.appService = "c4c" + this.configuration.appServiceSuffix;
					jQuery.sap.registerModulePath("c4c.locale", this.configuration.pathToDestination + "i18n");
					jQuery.sap.registerModulePath("c4c.table-appointmentcollection.local", this.configuration.appName);
					jQuery.sap.registerModulePath("c4c.table-appointmentcollection.remote", this.configuration.appName);
				} else {
					this.configuration.appService = "c4cPreview" + this.configuration.appServiceSuffix;
				}
			} catch (e) {
				this.configuration.appService = "c4cPreview" + this.configuration.appServiceSuffix;
			}

			window.generalNameSpace = this.configuration;
			window.generalNameSpace.utils = this.utils;
		},

		/** createContent - creats the table view , call the loadModelData function of the controller
		 * @returns view
		 */
		createContent: function() {
			var targetEntity = window.generalNameSpace.businessObject.targetEntity;

			var appEventsBus = new sap.ui.core.EventBus(),
				dialogView = sap.ui.view({
					viewName: "c4c.table-appointmentcollection.local.view.dialog",
					type: sap.ui.core.mvc.ViewType.XML,
					viewData: {
						eventBus: appEventsBus
					}
				}),
				view = sap.ui.view({
					viewName: "c4c.table-appointmentcollection.local.view.table",
					type: sap.ui.core.mvc.ViewType.XML,
					viewData: {
						targetEntity: targetEntity,
						queries: window.generalNameSpace.businessObject.queries,
						appEventsBus: appEventsBus,
						growingThreshold: window.generalNameSpace.businessObject.growingThreshold,
						detailsPageAlias: window.generalNameSpace.businessObject.detailsPageAlias,
						dialogView: dialogView
					}
				});

			view.addDependent(dialogView);
			var controller = view.getController();
			controller.loadModelData();

			return view;
		}
	});
});