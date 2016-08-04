(function() {
	"use strict";
	/*global  sap*/
	sap.ui.jsfragment("c4c.create-LeadCollection.remote.view.vhelpdialog", {

		/** Specifies the Controller belonging to this View.
		 *In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
		 *@memberOf view.View1
		 */
		getControllerName: function() {
			return "c4c.create-LeadCollection.remote.view.vhelpdialog";
		},

		/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
		 * Since the Controller is given to this method, its event handlers can be attached right away.
		 * @memberOf view.View1
		 */
		createContent: function(oController) {

			var params = oController.params,
				i,
				dialog,
				closeBtn,
				paramsArr = [],
				staticModel = oController.staticModel,
				translationAnnotationModel = oController.translationAnnotationModel,
				staticBundle,
				itemsStr,
				toolbar;

			staticBundle = staticModel.getResourceBundle();
			var annotationBundle = translationAnnotationModel.getResourceBundle();
			var translatedTitle = annotationBundle.getText(params.titleKey);
			paramsArr.push(translatedTitle);
			// paramsArr.push(params.fieldName);

			//if this is phone open the dialog in a stretch mode
			dialog = new sap.m.Dialog({
				//title: "Select "+ params.fieldName,
				title: staticBundle.getText("starterCreateTemplate.vhelp.dialog.dialogTitle", paramsArr)
			});

			if (sap.ui.Device.system.phone) {

				dialog.setStretch(true);

			} else {

				dialog.setContentHeight("50%");
				dialog.setContentWidth("50%");
			}

			dialog.cells = [];

			toolbar = new sap.m.Toolbar();

			//TODO Use params.searchSupported

			this.search = new sap.m.SearchField({
				width: "100%",
				search: oController.initiateFilter.bind(oController)

			});
			this.search.addStyleClass("searchVhelp_textBox");
			toolbar.addStyleClass("searchVhelp");
			toolbar.addContent(this.search);
			dialog.setSubHeader(toolbar);

			dialog.itemCount = new sap.m.Label();
			itemsStr = staticBundle.getText("starterCreateTemplate.vhelp.dialog.itemCount.label");
			dialog.itemCount.setText(itemsStr);
			dialog.itemCount.setDesign(sap.ui.commons.LabelDesign.Bold);
			dialog.addContent(dialog.itemCount);

			dialog.table = new sap.m.Table({
				inset: false,
				growing: true,
				growingThreshold: 15,
				mode: "SingleSelectMaster",
				growingScrollToLoad: true,
				selectionChange: oController.onRowSelected.bind(oController),
				columns: {
					path: "dataModel>/columns",
					template: new sap.m.Column({
						header: new sap.m.Text({
							text: "{dataModel>name}"
						})
					})
				}
			});

			for (i = 0; i < params.columns.length; i++) {
				dialog.cells.push(new sap.m.Label({
					text: "{" + params.columns[i].path + "}"
				}));
			}
			var oFilters = params.searchValue ? [new sap.ui.model.Filter(params.searchField, sap.ui.model.FilterOperator.StartsWith, params.searchValue)] : [];
			dialog.table.bindItems("/" + params.CollectionPath, new sap.m.ColumnListItem({
				cells: dialog.cells
			}), null, oFilters);

			dialog.table.attachUpdateFinished(null, function() {
				var tableRowCount = dialog.getModel().aBindings[0].getLength();
				paramsArr = [];
				paramsArr.push(tableRowCount);
				this.itemsStr = staticBundle.getText("starterCreateTemplate.vhelp.dialog.itemCount.label.withCounter", paramsArr);
				dialog.itemCount.$().text(this.itemsStr);
			});

			dialog.addContent(dialog.table);

			closeBtn = new sap.m.Button({
				text: staticBundle.getText("starterCreateTemplate.vhelp.dialog.close.btn"),
				press: oController.onDialogCloseButton.bind(oController)
			});

			dialog.addButton(closeBtn);

			/*add the search value if there is one to the search area in th  dialog window*/
			if (params.searchValue !== "") {
				this.search.setValue(params.searchValue);

			}

			var oModel = new sap.ui.model.json.JSONModel({
				columns: oController.params.columns
			});
			dialog.setModel(oModel, "dataModel");
			return dialog;
		}

	});
}());