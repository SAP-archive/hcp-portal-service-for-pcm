(function() {
	"use strict";
	/*global  jQuery, $, sap, window*/
	jQuery.sap.require("sap.m.MessageBox");

	sap.ui.controller("c4c.table-opportunitycollection.remote.view.table", {
		C4CoModel: null,
		targetEntity: null,
		tableFilters: [],
		appEventsBus: null,
		queries: null,
		detailsPageAlias: null,
		dialogView: null,
		template: null,
		hasContent: false,
		query: "",

		onInit: function() {
			this.totalCount = 0;
			this.currentIndex = 0;

			var customData = this.getView().getViewData();
			this.template = this.getTable().mBindingInfos.items.template;
			this.targetEntity = customData.targetEntity;
			this.appEventsBus = customData.appEventsBus;
			this.queries = customData.queries;
			this.detailsPageAlias = customData.detailsPageAlias;
			this.dialogView = customData.dialogView;
			this.getTable().setEnableBusyIndicator(false);
			this.growingThreshold = customData.growingThreshold;
			this.jsonModel = new sap.ui.model.json.JSONModel({
				growingThreshold: customData.growingThreshold,
				mode: sap.m.ListMode.SingleSelectMaster,
				queries: this.queries,
				targetEntity: this.targetEntity,
				showInfoBar: false,
				filterBtnEnable: true,
				infoBarLabel: ""
			});

			this.tableSettingsModel = new sap.ui.model.json.JSONModel({
				showBusyIndicator: false,
				showTriggerBusyIndicator: false
			});
			this.getView().setModel(this.tableSettingsModel, "tableSettingsModel");
			this.getView().setModel(this.jsonModel, "tableModel");
			this.existQueryType = 'Parameter';
			this.initEventListenrs();
		},

		hideBusyIndicator: function() {
			this.tableSettingsModel.setData({
				showBusyIndicator: false
			}, true);
		},

		showBusyIndicator: function() {
			this.tableSettingsModel.setData({
				showBusyIndicator: true
			}, true);
		},

		hideTriggerBusyIndicator: function() {
			this.tableSettingsModel.setData({
				showTriggerBusyIndicator: false
			}, true);
		},

		showTriggerBusyIndicator: function() {
			this.tableSettingsModel.setData({
				showTriggerBusyIndicator: true
			}, true);
		},

		/**
		 * initEventListenrs - add event listeners
		 * @memberOf view.c4ctable
		 */
		initEventListenrs: function() {
			var appEventsBus = this.appEventsBus;
			var that = this;

			//event from dialog
			appEventsBus.subscribe("dailog.view", "apply.filter", function(t, k, obj) {
				this.showBusyIndicator();
				this.setFiltersByQueriesFilters(that.query, obj.tableFilters);
				this.tableSorters = obj.tableSorters;
				this.displayStatusToolbar(obj.tableFiltersMap);
				this.applyTableFilters(that.oQuery);
			}.bind(this));
		},

		/**
		 * loadModelData - call the connectToC4C and getModelData functions inorder to get the
		 * metadata and the model
		 * @memberOf view.c4ctable
		 */
		loadModelData: function(queryId) {
			this.oQuery = window.generalNameSpace.utils.getQueryByName(queryId, this.queries);
			var filter;
			if (this.oQuery === null) {
				filter = [];
			} else {
				filter = this.oQuery.filter;
			}
			this.query = queryId;
			if (this.oQuery.type && this.oQuery.type === "Parameter") {
				this.tableFilters = window.generalNameSpace.utils.revertArrayToFiltersArray(filter);
				this.setFilterEnable(true);
			} else {
				this.tableFilters = window.generalNameSpace.utils.revertToFunctionImportFilter();
				this.setFilterEnable(false);
			}

			this.tableSorters = [];

			if (!this.C4CoModel) {
				this.C4CoModel = new sap.ui.model.json.JSONModel();
				this.C4CoModel.setData({
					boCollection: []
				});
				this.C4CoModel.setSizeLimit(100000);
				this.getTable().setModel(this.C4CoModel);
				this.initTable();
				this.hasContent = true;
			} else {
				this.setTableFilters(true);
			}
		},

		initTable: function initTable(funcName) {
			var finishLoading = false,
				table = this.getTable();

			if (table._oGrowingDelegate) {
				table._oGrowingDelegate.destroy();
				table._oGrowingDelegate = null;
			}

			this.funcName = funcName;
			this.totalCount = 0;
			this.currentIndex = 0;
			this.C4CoModel.getData().boCollection = [];

			this.showBusyIndicator();

			this.getTotalCount(function() {
				if (finishLoading) {
					this.onCountAndCollectionComplete();
				} else {
					finishLoading = true;
				}
			}.bind(this));

			this.getNextCollection(function() {
				if (finishLoading) {
					this.onCountAndCollectionComplete();
				} else {
					finishLoading = true;
				}
			}.bind(this));
		},

		onCountAndCollectionComplete: function onCountAndCollectionComplete() {
			this.onNextCollectionComplete();
		},

		onNextCollectionComplete: function onNextCollectionComplete() {
			this.updateTrigger();
			this.hideBusyIndicator();
			this.hideTriggerBusyIndicator();
		},

		updateTrigger: function updateTrigger() {
			var collectionLength = this.getCollectionLength();

			this.getTrigger().find(".trigger-description").text("[ " + collectionLength + " / " + this.totalCount + " ]");
			this.getTrigger()[collectionLength >= this.totalCount ? "removeClass" : "addClass"]("show");
		},

		getCollectionLength: function getCollectionLength() {
			return this.getTable().getItems().length;
		},

		getTrigger: function getTrigger() {
			if (!this.trigger) {
				this.trigger = this.getView().$().find(".table-trigger");
				this.trigger.on("click", function() {
					this.showTriggerBusyIndicator();
					this.getNextCollection(this.onNextCollectionComplete.bind(this));
				}.bind(this));
			}

			return this.trigger;
		},

		getNextCollection: function getNextCollection(callback) {

			var isInitialRequest = (this.currentIndex === 0 ? true : false);

			this.ajaxOdataOverride(function(data) {
				var newCollection = data.d.results || [],
					currentCollection = this.C4CoModel.getData() || [];

				currentCollection.boCollection = currentCollection.boCollection.concat(newCollection);
				this.C4CoModel.setData(currentCollection, true);
				this.currentIndex += newCollection.length;
				callback();
			}.bind(this), false, isInitialRequest);
		},

		getTotalCount: function getTotalCount(callback) {
			this.ajaxOdataOverride(function(data) {
				this.totalCount = data;
				this.setTableCounter();
				this.setComboboxCount(data);
				callback();
			}.bind(this), true);
		},

		ajaxOdataOverride: function ajaxOdataOverride(callback, isCount, isInitialReq) {
			var filterParams = sap.ui.model.odata.ODataUtils._createFilterParams(this.tableFilters),
				sortParams = sap.ui.model.odata.ODataUtils.createSortParams(this.tableSorters),
				url = this.getServiceUrl() + "/" + (this.funcName || this.targetEntity);

			if (isCount) {
				url += "/$count";
			} else {
				url += "?$skip=" + this.currentIndex + "&$top=" + this.growingThreshold;
			}

			if (sortParams && !isCount) {
				url += "&" + sortParams;
			}

			if (filterParams) {
				var c = isCount ? "?" : "&";
				url += (c + "$filter=" + filterParams);
			}

			$.ajax({
				type: "GET",
				url: url,
				dataType: "json",
				success: function(data, textStatus, jqXHR) {
					callback(data, textStatus, jqXHR);
				},
				error: function(xhr) {
					if (isInitialReq) {
						this.C4CoModel.setData({
							boCollection: []
						});
						this.hideBusyIndicator();
					} else {
						this.hideTriggerBusyIndicator();
					}

					this.onError(xhr);

				}.bind(this)
			});
		},
		onError: function onError(xhr) {
			var errorDoc, errorMessage, title = "";
			var bundle = this.getView().getModel("i18n_Static").getResourceBundle();

			try {
				if (xhr.responseXML) {
					errorDoc = $(xhr.responseXML);
				} else if (xhr.responseText) {
					errorDoc = $.parseXML(xhr.responseText);

				}
				var error = $(errorDoc).find("message");
				errorMessage = $(error[0]).text();
			} catch (err) {
				errorMessage = bundle.getText("dialog.body.error");
			}
			this.hideBusyIndicator();
			title = bundle.getText("dialog.title.error");

			sap.m.MessageBox.show(errorMessage, {
				title: title,
				icon: sap.m.MessageBox.Icon.ERROR
			});
		},

		/**
		 * connectToC4C - get the general metadata (/pcmportal/$metadata)
		 * @memberOf view.c4ctable
		 * @returns oModel
		 */
		getModelFormService: function(query) {
			var src = this.getServiceUrl(query);
			var oModel = new sap.ui.model.odata.ODataModel(src, false);
			return oModel;
		},

		/** navigateToDetails - navigate to the details component with the objectDetailsId context
		 * @memberOf view.c4ctable
		 * @param oEvent
		 * @returns objectDetailsId
		 */
		navigateToDetails: function(oEvent) {
			var object = oEvent.oSource.oPropagatedProperties.oBindingContexts.undefined,
				modelObject,
				path = object.sPath,
				semanticObject = oEvent.oSource.data("targetObject"),
				action = oEvent.oSource.data("action"),
				objectDetailsId;

			if (path) {
				modelObject = this.getTable().getModel().getObject(path);
				if (modelObject) {
					object = modelObject;
				}
			}

			objectDetailsId = object.ObjectID;

			try {
				if (sap.ushell.services.AppConfiguration) {
					var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
					//var semanticObjectValue = window.generalNameSpace.businessObject.semanticObject;
					oCrossAppNavigator.toExternal({
						target: {
							semanticObject: semanticObject,
							action: action
						},
						params: {
							objectId: objectDetailsId
						}
					});

				}
			} catch (e) {}

			return objectDetailsId;
		},

		/** handleOpenDialog - open the table settings dialog
		 * @memberOf view.c4ctable
		 */
		handleOpenDialog: function() {
			this.dialogView.getController().open();
		},

		/** getServiceUrl - returns differant query for each scenario (RDE/HCP)
		 * @memberOf view.c4ctable
		 * @returns portalQuery/defaultQuery
		 */
		getServiceUrl: function() {
			var query = window.generalNameSpace.appService;
			try {
				if (sap.ushell.services.AppConfiguration) {
					/* fiori scenario */
					query = window.generalNameSpace.pathToDestination + window.generalNameSpace.appService;
					return query;
				}
			} catch (e) {}
			query = "/" + query;
			return query;
		},

		/** setQueryComboBoxSelection - set the query combobox selection, when item is not defined the defaultQuery will be selected
		 * @memberOf view.c4ctable
		 * @param item
		 */
		setQueryComboBoxSelection: function(eItem) {
			var item = eItem || window.generalNameSpace.utils.getDefaultQuery(this.queries);
			this.getQueryCombobox().setSelectedKey(item);
		},

		getQueryCombobox: function() {
			return this.getView().byId("queryCombobox");
		},

		setComboboxCount: function(data) {
			var comboBoxValue = this.getQueryCombobox().getValue();
			if (comboBoxValue.indexOf("(") > -1 && comboBoxValue.indexOf(")") > -1) {
				this.getQueryCombobox().setValue(this.getQueryCombobox().getValue().replace(new RegExp(/\d+/), data));
			} else {
				this.getQueryCombobox().setValue(this.getQueryCombobox().getValue() + "(" + data + ")");
			}
		},

		setTableFilters: function(reset) {
			if (this.tableFilters.length !== 0 || reset === true) {
				this.applyTableFilters(this.oQuery);
				this.showInfoBar(false);
			}
		},

		setTableCounter: function() {
			this.jsonCountModel = new sap.ui.model.json.JSONModel({
				count: "(" + this.totalCount + ")"
			});

			this.getView().setModel(this.jsonCountModel, "tableCountModel");
		},

		toolBarPressed: function() {
			this.showBusyIndicator();
			this.showInfoBar(false);
			this.dialogView.getController().resetTableFilters(true);
			this.loadModelData(this.query);
		},

		showInfoBar: function(show) {
			this.jsonModel.setData({
				showInfoBar: show
			}, true);
		},

		setFilterEnable: function(isEnable) {
			this.jsonModel.setData({
				filterBtnEnable: isEnable
			}, true);
		},

		setInfoBarLabelText: function(filterString) {
			this.jsonModel.setData({
				infoBarLabel: filterString
			}, true);
		},

		queryChanged: function(oEvent) {
			var queryId = oEvent.oSource.getSelectedItem().getKey();

			this.showBusyIndicator();
			if (queryId !== this.query) {
				this.dialogView.getController().resetTableFilters(true);
				this.loadModelData(queryId);
			}
		},

		openDialog: function() {
			this.handleOpenDialog();
		},

		handleCreateRecord: function() {
			try {
				if (sap.ushell.services.AppConfiguration) {
					var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
					var semanticObjectValue = window.generalNameSpace.businessObject.semanticObject;
					oCrossAppNavigator.toExternal({
						target: {
							semanticObject: semanticObjectValue,
							action: "Create"
						},
						params: {}
					});

				}
			} catch (e) {}

			return;
		},

		handleNavButtonPress: function() {
			try {
				if (sap.ushell.services.AppConfiguration) {
					window.history.go(-1);
				}
			} catch (e) {}
			return;
		},

		setFiltersByQueriesFilters: function(query, filters) {
			var oQuery = window.generalNameSpace.utils.getQueryByName(query, this.queries),
				oFilter, index1, index2, found = false;
			if (oQuery === null) {
				oFilter = [];
			} else {
				oFilter = oQuery.filter;
			}
			this.filtersToDisplay = filters;
			for (index1 = 0; index1 < this.filtersToDisplay.length; index1++) {
				for (index2 = 0; index2 < oFilter.length; index2++) {
					if (oFilter[index2].key === this.filtersToDisplay[index1].sPath) {
						found = true;
						break;
					}
				}
				if (found) {
					this.filtersToDisplay.splice(index1, 1);
					index1--;
				}
			}

			this.tableFilters = window.generalNameSpace.utils.revertArrayToFiltersArray(oFilter).concat(this.filtersToDisplay);
			return {
				tableFilters: this.tableFilters,
				filtersToDisplay: this.filtersToDisplay
			};
		},

		/** getTable - returns the view's table
		 * @memberOf view.c4ctable
		 * @return c4cTable
		 */
		getTable: function() {
			return this.getView().byId("c4cTable");
		},

		/**
		 * displayStatusToolbar - set the toolbar string and visibility
		 * @memberOf view.c4ctable
		 * @param aFilters
		 */
		displayStatusToolbar: function(aFilters) {
			//var filterString = "{i18n_Static>starterTableTemplate.table.infoToolbar.title}",
			var filterString = "",
				str = "",
				paramArr = [],
				i = 0,
				item;

			for (item in aFilters) {
				if (i > 0) {
					filterString += ", ";
				}

				filterString += item + " : \'" + aFilters[item] + "\'";
				i++;
			}
			paramArr.push(filterString);
			str = this.getView().getModel("i18n_Static").getResourceBundle().getText("starterTableTemplate.table.infoToolbar.title", paramArr);

			this.setInfoBarLabelText(str);
			this.showInfoBar(true);

			if (i === 0) {
				this.showInfoBar(false);
			}
		},

		/**
		 * applyTableFilters - filter the table
		 * @memberOf view.c4ctable
		 * @param aFilters
		 */
		applyTableFilters: function(query) {
			if (query.type === "Parameter") {
				this.initTable();
			} else {
				this.initTable(query.funcName);
			}
		},

		formatDate: function(eDate) {
			var date = eDate;
			if (!date) {
				return "";
			}

			var dateFormat = sap.ui.core.format.DateFormat.getInstance();
			date = this.getTimeFromJsonTime(date);
			return dateFormat.format(new Date(date));
		},

		formatTimeDate: function(eDate) {
			var date = eDate;
			if (!date) {
				return "";
			}

			var dateTimeFormat = sap.ui.core.format.DateFormat.getDateTimeInstance();
			date = this.getTimeFromJsonTime(date);
			return dateTimeFormat.format(new Date(date));
		},

		getTimeFromJsonTime: function getTimeFromJsonTime(date) {
			var newDate = date.replace(/\/Date\(|\)\//g, "");
			newDate = parseInt(newDate, 10);
			return (isNaN(newDate) ? date : newDate);
		}
	});
}());