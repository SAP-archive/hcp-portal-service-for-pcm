(function() {
	"use strict";
	/*global  setTimeout, sap, window*/
	/*eslint  sap-timeout-usage: 1 */
	sap.ui.controller("c4c.create-PartnerCollection.remote.view.vhelpdialog", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf view.vhelp
		 */
		oDialog: null,
		onInit: function(data) {
			this.eventBus = data.eventBus;
			this.translationAnnotationModel = data.translationAnnotationModel;
			this.params = this.convertParams(data.params);
			this.staticModel = data.staticModel;
			this.oDialog = sap.ui.jsfragment("c4c.create-PartnerCollection.remote.view.vhelpdialog", this);

		},

		initiateFilter: function initiateFilter(oEvt) {
			var value = oEvt.getSource().getValue();

			// Replace first and last char: *
			value = value.replace(/^\*|\*$/g, "");

			this.filterTable(value);
			/*Update the item count lable at the top of the table*/

		},

		filterTable: function(value) {
			var tableRowCount = this.oDialog.getModel().aBindings[0].getLength();

			this.oDialog.itemCount.$().text(tableRowCount + " Items");

			/*If there is value in the search field filter the results*/
			var filters = [];
			if (value) {

				var oFilter = new sap.ui.model.Filter(this.params.searchByField, sap.ui.model.FilterOperator.Contains, value);
				filters.push(oFilter);
			}
			this.oDialog.table.bindItems("/" + this.params.CollectionPath, new sap.m.ColumnListItem({
				cells: this.oDialog.cells
			}), null, filters);

		},

		convertParams: function convertParams(params) {
			var res = {
					BusinessObject: params.BusinessObject,
					CollectionPath: params.CollectionPath.indexOf("Collection") >= 0 ? params.CollectionPath : (params.CollectionPath + "Collection"), //TODO remove Collection
					searchSupported: params.searchSupported,
					fieldName: params.fieldName,
					searchValue: params.searchValue,
					columns: [],
					titleKey: params.titleKey,
					prefixKey: params.prefixKey
				},
				searchField,
				columnName,
				i;

			for (i in params.viewParams) {
				if (params.viewParams.hasOwnProperty(i)) {
					columnName = this.getTranslatedTitle(params.prefixKey, i);
					res.columns.push({
						name: columnName,
						path: i,
						localsIds: params.viewParams[i]
					});

					searchField = params.viewParams[i] && params.viewParams[i][0];
					if (searchField === params.fieldName) {
						res.searchField = i;
					}
				}
			}
			if (params.filterable && params.filterable.length > 0) {
				res.searchByField = params.filterable[0];
			}

			return res;
		},

		getTranslatedTitle: function(titlePrefix, key) {
			var annotationBundle = this.translationAnnotationModel.getResourceBundle();
			var titleKey = titlePrefix + "." + key;
			var translatedTitle = annotationBundle.getText(titleKey);
			return translatedTitle;

		},

		closeDialog: function closeDialog() {
			this.oDialog.close();
		},

		openDialog: function() {

			var dialog = this.oDialog;
			dialog.table.setBusy(true);
			dialog.open();

			setTimeout(function() {

				var url = this.getServiceUrl(window.generalNameSpace.appService);
				//  var oDataModel = new sap.ui.model.odata.ODataModel("/" + window.generalNameSpace.appService, false);
				var oDataModel = new sap.ui.model.odata.ODataModel(url, false);

				oDataModel.attachRequestCompleted(null, function() {

					dialog.table.setBusy(false);

				});

				dialog.setModel(oDataModel);

			}.bind(this), 100);

		},

		getServiceUrl: function(path) {
			return window.generalNameSpace.pathToDestination + path;

		},

		onDialogCloseButton: function onDialogCloseButton() {
			this.closeDialog();

			this.destroy();
		},

		onRowSelected: function onRowSelected(oEvent) {
			var res = this.getSelectedRowObject(oEvent.getSource());
			this.closeDialog();
			this.eventBus.publish("dialog.event", "value.changed", res);
		},

		getSelectedRowObject: function getSelectedRowObject(table) {
			var res = {},
				data = this.oDialog.getModel("dataModel").getData(),
				columns = data.columns,
				selectedCells = table.getSelectedItem().getCells(),
				column,
				i;

			for (i = 0; i < selectedCells.length; i++) {
				column = columns[i];
				if (column.localsIds && column.localsIds.length > 0) {
					res[column.name] = {
						value: selectedCells[i].getText(),
						localsIds: column.localsIds
					};
				}
			}

			return res;
		}
	});
}());