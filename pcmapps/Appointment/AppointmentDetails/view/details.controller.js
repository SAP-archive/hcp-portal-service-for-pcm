(function() {
	"use strict";
	/*global  jQuery, $, FileReader, BackendCall, sap, window, atob, Blob, document, navigator*/
	/*eslint-disable space-unary-word-ops*/
	jQuery.sap.require("sap.m.MessageBox");

	sap.ui.controller("c4c.details-appointmentcollection.local.view.details", {

		valueHelpersMetaData: {
			"Appointment": {
				"combobox": {
					"Category": {
						"CollectionPath": "AppointmentCategory",
						"searchSupported": false,
						"viewParams": {
							"Code": [
								"Category"
							],
							"Description": null
						},
						"filterable": [],
						"comboBox": true,
						"BusinessObject": "AppointmentCollection",
						"enabled": true
					},
					"Priority": {
						"CollectionPath": "AppointmentPriority",
						"searchSupported": false,
						"viewParams": {
							"Code": [
								"Priority"
							],
							"Description": null
						},
						"filterable": [],
						"comboBox": true,
						"BusinessObject": "AppointmentCollection",
						"enabled": true
					}
				}
			},
			"AppointmentInvolvedParty": {},
			"AppointmentNote": {},
			"AppointmentAttachment": {
				"combobox": {
					"CategoryCode": {
						"CollectionPath": "AppointmentAttachmentCategoryCode",
						"searchSupported": false,
						"viewParams": {
							"Code": [
								"CategoryCode"
							],
							"Description": null
						},
						"filterable": [],
						"comboBox": true,
						"BusinessObject": "AppointmentAttachmentCollection",
						"enabled": true
					}
				}
			}
		},

		updateFields: ["ObjectID", "ActivitytypeCode", "AppointmentEndDateTime", "AppointmentStartDateTime", "Category", "DocumentType",
			"Location", "Owner", "Priority", "Status", "SubjectName"
		],
		openValueHelpDialog: function openValueHelpDialog(oController) {

			this.eventBus = new sap.ui.core.EventBus();
			this.registerEvents();

			//this.whoAmIKey = oController.getSource().getId().replace(this.getView().getId() + "--","");
			this.whoAmIKey = oController.getSource().getName();
			this.whoAmIBo = this.valueHelpersMetaData[this.tableName][this.whoAmIKey].BusinessObject.replace(/Collection/, "");

			var valueHelpMetaData = this.valueHelpersMetaData[this.tableName][this.whoAmIKey];

			valueHelpMetaData.searchValue = oController.getSource()._$input.val();
			var oValueHelpDialog = sap.ui.controller("c4c.details-appointmentcollection.local.view.vhelpdialog");
			var staticModel = this.getView().getModel("i18n_Static");
			var translationAnnotationModel = this.getView().getModel("i18n");
			oValueHelpDialog.onInit({
				eventBus: this.eventBus,
				params: valueHelpMetaData,
				staticModel: staticModel,
				translationAnnotationModel: translationAnnotationModel
			});

			oValueHelpDialog.openDialog();
		},

		getTitle: function(x, y) {
			return y ? x + '(' + y + ')' : x;
		},

		getFieldDetails: function(x, y) {
			return x + " " + y;
		},

		registerEvents: function registerEvents() {
			this.eventBus.subscribe("dialog.event", "value.changed", function(v, e, obj) {
				this.onValueHelpChanged(obj);
			}.bind(this));
		},

		onValueHelpChanged: function onValueHelpChanged(obj) {

			var oModel,
				updateData = {},
				i, j,
				updateObj;

			if (window.generalNameSpace.businessObject.targetEntity.replace(/Collection/, "") === this.tableName) {
				oModel = this.getView().getModel("EditObjectPageModel");
				updateObj = updateData[this.whoAmIBo] = {};
			} else {
				oModel = this.oDialog.getModel();
				updateObj = updateData;
			}

			for (i in obj) {
				if (obj.hasOwnProperty(i)) {
					for (j = 0; j < obj[i].localsIds.length; j++) {
						updateObj[obj[i].localsIds[j]] = obj[i].value;
					}
				}
			}

			oModel.setData(updateData, true);
		},
		isValidFormInFragment: function(fragment) {
			var input,
				inputId,
				isValid = true,
				that = this,
				bundle,
				labels = fragment.$().find(".sapMLabelRequired:visible");

			labels.each(function() {
				input = $(this).closest(".sapMVBox").find("input");
				inputId = input.attr("id");
				inputId = inputId.indexOf("-inner") >= 0 ? inputId.substr(0, inputId.indexOf("-inner")) : inputId;
				input = sap.ui.getCore().byId(inputId);
				if (input) {
					if (!input.getValue()) {
						isValid = false;
						input.setValueState("Error");
						bundle = that.getView().getModel("i18n_Static").getResourceBundle();
						sap.m.MessageToast.show(bundle.getText("starterCreateTemplate.create.error.save.notification"));
					} else {
						input.setValueState("None");
					}
				}
			});

			if (isValid) {
				input = fragment.$().find(".sapMInputBaseErrorInner");
				if (input.length) {
					isValid = false;
					bundle = that.getView().getModel("i18n_Static").getResourceBundle();
					sap.m.MessageToast.show(bundle.getText("starterCreateTemplate.create.additional.error.save.notification"));
				}

			}
			return isValid;

		},

		isValidForm: function() {
			var fragment = this.getFormFragment("Edit");
			var isValid = this.isValidFormInFragment(fragment);
			return isValid;
		},

		resetForm: function() {
			var fragment = this.getFormFragment("Edit");
			var input = fragment.$().find(".sapMInputBaseErrorInner");
			var inputId;
			input.each(function(i, val) {
				inputId = val.id;
				inputId = inputId.indexOf("-inner") >= 0 ? inputId.substr(0, inputId.indexOf("-inner")) : inputId;
				input = sap.ui.getCore().byId(inputId);
				input.setValueState("None");
			});
		},

		handleRequiredInputChange: function handleRequiredInputChange(oEvent) {
			var src = oEvent.getSource();
			var type = src.getType();
			if (type === "Number") {
				if (src.getValue() === "") {
					src.setValueState("Error");
					return;
				}
			}
			src.setValueState("None");
		},

		onInit: function() {
			var params = this.getView().getViewData() || {};

			if (params.id) {
				this.loadData(params.id);
			} else if (params.functionImport) {
				this.getObjectIdByFunctionImport(params.functionImport, function(receivedObjectId) {
					this.loadData(receivedObjectId);
				}.bind(this));
			} else {
				this.getFirstRowID(function(receivedObjectId) {
					this.loadData(receivedObjectId);
				}.bind(this));
			}
		},

		loadData: function(collectionId) {

			var viewData = {
				"Appointment": {
					"SubjectName": null,
					"Account": null,
					"AccountID": null,
					"Location": null,
					"AppointmentStartDateTime": null,
					"AppointmentEndDateTime": null,
					"Category": null,
					"Priority": null,
					"StatusText": null
				},
				"AppointmentInvolvedParty": {},
				"AppointmentNote": {
					"Text": null
				},
				"AppointmentAttachment": {
					"CategoryCode": null,
					"Name": null,
					"LinkWebURI": null
				}
			};

			var oJsonModel = new sap.ui.model.json.JSONModel(),
				businessObject = window.generalNameSpace.businessObject,
				src = this.getServiceUrl(businessObject.oDataService),
				oDataServiceModel = new sap.ui.model.odata.ODataModel(src, false, null, null, null, false, false, true),
				collectionApi = "/" + businessObject.targetEntity + "('" + collectionId + "')",
				counter = new sap.ui.model.json.JSONModel(),
				facetsStateModel = new sap.ui.model.json.JSONModel();

			oJsonModel.setSizeLimit(260);
			this.collectionId = collectionId;
			this.getView().setModel(counter, "tableCountModel");
			this.getView().setModel(facetsStateModel, "facetStateModel");
			this.tableName = businessObject.semanticObject;

			var bo, obj = this.valueHelpersMetaData;
			for (bo in obj) {
				if (obj.hasOwnProperty(bo) && bo !== window.generalNameSpace.businessObject) {
					this.setFacetState(bo, "view");
				}
			}

			oDataServiceModel.attachMetadataLoaded({}, function() {
				oDataServiceModel.read(collectionApi, null, null, true, function(data) {
					oJsonModel.setData({
						"Appointment": data
					}, true);
					this.facetLoaded(true);
				}.bind(this), this.onError.bind({
					scope: this
				}));

				this.readSubObject(oDataServiceModel, collectionApi, "AppointmentInvolvedParty", oJsonModel, counter);
				this.readSubObject(oDataServiceModel, collectionApi, "AppointmentNote", oJsonModel, counter);
				this.readSubObject(oDataServiceModel, collectionApi, "AppointmentAttachment", oJsonModel, counter);

			}.bind(this));

			this.oObjectPageStateModel = new sap.ui.model.json.JSONModel({
				showBusyIndicator: true,
				scrollingSectionId: "", //the only property that is not really bindable
				sections: businessObject.sections,
				info: {
					detailsImage: businessObject.detailsImage
				}
			});

			this.getView().setModel(oJsonModel, "ObjectPageModel");
			this.getView().setModel(this.oObjectPageStateModel, "ObjectPageState");
			this.viewData = viewData;

			this.eventBus = new sap.ui.core.EventBus();
			this.registerEvents();
		},

		hideBusyIndicator: function() {
			if (this.oObjectPageStateModel) {
				this.oObjectPageStateModel.setData({
					showBusyIndicator: false
				}, true);
			}
		},

		showBusyIndicator: function() {
			if (this.oObjectPageStateModel) {
				this.oObjectPageStateModel.setData({
					showBusyIndicator: true
				}, true);
			}
		},

		facetLoaded: function() {
			this.hideBusyIndicator();
		},

		onExit: function onExit() {
			for (var sPropertyName in this.formFragments) {
				if (!this.formFragments.hasOwnProperty(sPropertyName)) {
					return;
				}

				var fragment = this.formFragments[sPropertyName];

				if (fragment) {
					fragment.destroy();
					this.formFragments[sPropertyName] = null;
				}
			}
		},

		handleShowAttachment: function handleShowAttachment(oEvent) {

			function download(data) {

				function multipleClick(element) {
					var evt = document.createEvent("MouseEvents");
					evt.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0,
						false, false, false, false, 0, null);
					element.dispatchEvent(evt);
				}

				function base64toBlob(base64Data, eContentType) {
					var contentType = eContentType || "";
					var sliceSize = 1024;
					var byteCharacters = atob(base64Data);
					var bytesLength = byteCharacters.length;
					var slicesCount = Math.ceil(bytesLength / sliceSize);
					var byteArrays = new Array(slicesCount);

					for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
						var begin = sliceIndex * sliceSize;
						var end = Math.min(begin + sliceSize, bytesLength);

						var bytes = new Array(end - begin);
						for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
							bytes[i] = byteCharacters[offset].charCodeAt(0);
						}
						byteArrays[sliceIndex] = new Uint8Array(bytes);
					}
					return new Blob(byteArrays, {
						type: contentType
					});
				}

				if (data.autoload) {

					if (Blob) {

						var url;
						if (navigator.appVersion.toString().indexOf(".NET") > 0) {
							url = window.navigator.msSaveOrOpenBlob(
								base64toBlob(data.content, data.type),
								data.fileName
							);
						} else {
							url = window.URL.createObjectURL(
								base64toBlob(data.content, data.type)
							);
						}

					} else {

						/**
						 * Define url
						 * @type {string}
						 */
						url = data.contentBase64;
					}

					var b = $("<a />").attr({
						href: url,
						target: "_blank",
						download: data.fileName
					}).text("Download");

					try {
						if (url.length < 500000) {
							//window.open(url);
							multipleClick(b[0]);
						}
					} catch (e) {}
				}
			}

			var src = oEvent.getSource(),
				path = src.oPropagatedProperties.oBindingContexts.ObjectPageModel.sPath,
				idx = parseInt(path.substring(path.lastIndexOf("/") + 1), 10),
				data = this.getView().getModel(this.modelName).getData(),
				item = data[this.tableName][idx],
				contentBase64 = "data:" + item.MimeType + ";base64," + item.Binary;

			if (item.CategoryCode === "2") {

				download({
					autoload: true,
					contentBase64: contentBase64,
					content: item.Binary,
					type: item.MimeType,
					fileName: src.getText()
				});
			}

			if (item.CategoryCode === "3" && item.LinkWebURI.length > 0) {

				var a = $("<a />").attr({
					target: "_blank",
					href: item.LinkWebURI
				}).text("Link");

				a[0].click();
			}
		},

		openActions: function openActions(oEvent) {
			var oButton = oEvent.getSource();
			this.setEditableContext(oEvent.getSource());
			if (!this.actionSheet) {
				this.actionSheet = sap.ui.xmlfragment(
					"c4c.details-appointmentcollection.local.view.actions.actionsSheet",
					this
				);

				this.getView().addDependent(this.actionSheet);
			}

			this.actionSheet.openBy(oButton);
		},

		actionPressed: function(oEvent) {
			var opts,
				data = oEvent.getSource().data(),
				key,
				params = [];

			for (key in data) {
				if (data.hasOwnProperty(key) && key !== "funcName") {
					params.push(data[key]);
				}
			}

			opts = {
				funcName: oEvent.getSource().data("funcName"),
				params: params,
				collectionId: this.collectionId
			};
			this.showBusyIndicator();
			BackendCall.doCall({
				successCallback: this.updateBOAfterChange.bind({
					scope: this
				}),
				errorCallback: this.onError.bind({
					scope: this
				}),
				method: "POST",
				url: window.generalNameSpace.businessObject.oDataService + "/" + opts.funcName + "?ObjectID='" + opts.collectionId + "'",
				contentType: "application/json;charset=utf-8"
			});
		},

		readSubObject: function(oDataServiceModel, collectionApi, subBObject, oJsonModel, counter) {
			var hash = {};

			oDataServiceModel.read(collectionApi + "/" + subBObject, null, null, true, function(data) {
				var obj = {};
				obj[this.subBObject] = data.results;
				oJsonModel.setData(obj, true);
				if (data.results !== undefined) {
					hash[this.subBObject + "Count"] = data.results.length;
				}

				counter.setData(hash, true);
			}.bind({
				subBObject: subBObject
			}), this.onError.bind({
				scope: this
			}));
		},

		handleIconTabBarSelect: function handleIconTabBarSelect(oEvent) {
			var oBar = oEvent.getSource();
			oBar.setExpanded(true);
			oBar.setExpandable(false);

			this.setEditableContext({
				data: function(type) {
					var data = {
						table: oBar.getSelectedKey(),
						model: "ObjectPageModel"
					};
					return data[type];
				}
			});

			var overViewEdit = this.overViewEdit;

			if (overViewEdit) {
				this.handleOverviewEdit({
					getSource: function() {
						return overViewEdit;
					},
					isActive: function() {
						return true;
					}
				});
			}

			this.handleEditBtn(
				this.getView().getModel("ObjectPageModel").getData()[oBar.getSelectedKey()],
				sap.ui.getCore().byId(oBar.$().find("button.deleteBtn").attr("id"))
			);

			this.editButtonEnabled(
				this.getView().getModel("ObjectPageModel").getData()[oBar.getSelectedKey()],
				sap.ui.getCore().byId(oBar.$().find("button.updateBtn").attr("id"))
			);
		},

		// Handle enable/disable edit button when "No data"
		handleEditBtn: function handleEditBtn(items, oEditButton) {

			if (!oEditButton || !items) {
				return false;
			}

			var length = items.length > 0,
				oTable = sap.ui.getCore().byId(jQuery("." + this.tableName)[0].id);

			if (oTable.getMode) {
				if (oTable.getMode() === "Delete") {
					if (length) {
						var $btn = oEditButton.$().find("div:first");
						$btn.addClass("btnActive");
					} else {
						oEditButton.firePress();
					}
				}
				oEditButton.setEnabled(length && this.getFacetState() !== "edit");
			}
		},

		navigateTo: function navigateTo(oEvent) {
			var path = oEvent.getSource().data("navigateTo"),
				$tabsContainer = $(".sapMITH"),
				$tab = $tabsContainer.find(".sapMITBFilter:contains(" + path + ")");

			try {

				var oTab = sap.ui.getCore().byId($tab[0].id);

				oTab.getParent().setSelectedItem(oTab);

			} catch (e) {
				this.showMsg("undefined path:" + path);
			}

		},

		handleNavButtonPress: function() {
			try {
				if (sap.ushell.services.AppConfiguration) {
					window.history.go(-1);
				}
			} catch (e) {}
			return;
		},

		getServiceUrl: function(query) {
			return window.generalNameSpace.pathToDestination + query;
		},

		handleExit: function handleExit() {
			this.dialogType = undefined;
			if (this.oDialog) {
				this.oDialog.destroy();
			}
		},

		handleOpenDialog: function(oEvent) {
			this.oDialog = sap.ui.xmlfragment("c4c.details-appointmentcollection.local.view.dialog.delete", this);
			this.getView().addDependent(this.oDialog);
			this.oDialog.contextPathCaller = oEvent.getParameter("listItem").getBindingContextPath();
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oDialog);
			this.oDialog.open();
		},

		handleConfirm: function() {
			var view = this.getView(),
				path = this.oDialog.contextPathCaller,
				idx = parseInt(path.substring(path.lastIndexOf("/") + 1), 10),
				oModel = view.getModel(this.modelName),
				data = oModel.getData(),
				items = data[this.tableName];

			var deleteData = {};
			deleteData.ObjectID = items[idx].ObjectID;
			deleteData.tableName = this.tableName;
			deleteData.deletedItem = items[idx];
			deleteData.indexDeletedItem = idx;

			items.splice(idx, 1);
			oModel.setData(data);
			this.handleExit();
			this.showBusyIndicator();

			BackendCall.doCall({
				successCallback: this.onDeleteSuccess.bind({
					scope: this,
					data: deleteData
				}),
				errorCallback: this.onDeleteError.bind({
					scope: this,
					data: deleteData
				}),
				completeCallback: this.onDeleteComplete.bind({
					scope: this
				}),
				method: "DELETE",
				url: window.generalNameSpace.businessObject.oDataService + "/" + deleteData.tableName + "Collection" + "('" + deleteData.ObjectID +
					"')",
				contentType: "application/json;charset=utf-8"
			});
		},

		onDeleteComplete: function onDeleteComplete() {
			this.scope.hideBusyIndicator();
		},

		onDeleteError: function onDeleteError(xhr) {
			this.scope.restoreRow(this.scope, this.data);
			this.scope.onError.bind({
				scope: this
			})(xhr);
		},

		onDeleteSuccess: function onDeleteSuccess() {
			var oModel = this.scope.getView().getModel(this.scope.modelName),
				modelData = oModel.getData(),
				items = modelData[this.data.tableName];
			var oCountModel = this.scope.getView().getModel("tableCountModel"),
				modelCountData = oCountModel.getData();
			modelCountData[this.data.tableName + "Count"] = items.length;
			oCountModel.setData(modelCountData);

			var bundle = this.scope.getView().getModel("i18n_Static").getResourceBundle();
			sap.m.MessageToast.show(bundle.getText("starterDetailsPage.dialog.delete.record"));

			this.scope.handleEditBtn(
				items,
				sap.ui.getCore().byId(this.scope.getView().$().find("button.deleteBtn").attr("id"))
			);
			this.scope.editButtonEnabled(
				items,
				sap.ui.getCore().byId(this.scope.getView().$().find("button.updateBtn").attr("id"))
			);
		},

		handleDelete: function handleDelete(oEvent) {
			this.handleOpenDialog(oEvent);
		},

		enableAdd: function enableAdd(oEvent) {
			var oModel = this.getView().getModel(this.modelName);
			this.disableEdit(oEvent);
			this.showAddDialog(oModel, oEvent);
		},

		showAddDialog: function showAddDialog() {
			this.dialogType = "createFacetRow";
			var fragmentName = "c4c.details-appointmentcollection.local.view.dialog." + this.tableName + "Add";
			this.oDialog = sap.ui.xmlfragment(fragmentName, this);
			this.getView().addDependent(this.oDialog);

			var oViewModel = new sap.ui.model.json.JSONModel();
			oViewModel.setSizeLimit(260);
			this.oDialog.setModel(oViewModel);

			var viewData = this.viewData[this.tableName];
			this.resetFormForDialog(viewData);
			///
			function updateModel() {
				// oViewModel.setData(this.viewData[this.tableName]);
				this.oViewModel.setData(this.scope.viewData[this.scope.tableName]);
			}

			var isAttachment = this.tableName.match(/Attachment/),
				afterRenderingSuper = this.oDialog.onAfterRendering.bind(this.oDialog);

			this.oDialog.fixUI = function(hide, url, eUpload) {
				var upload = eUpload;
				if (isAttachment) {

					var dialog = this.getDomRef(),
						oUrl = $("div[id*='LinkWebURI']", dialog).parents(".sapMVBox").parent(),
						form = $("form[enctype*='multipart']", dialog).parents(".sapMVBox").parent(),
						combo = sap.ui.getCore().byId(
							$("div[id^='CategoryCode']", dialog).attr("id")
						);
					upload = $("form input[id*='fu_input'], form button", dialog);

					if (!combo) {
						//this mean that annotation not configured well
						return false;
					}
					if (oUrl) {
						oUrl[hide ? "hide" : "show"]();
					}

					if (upload) {
						form[hide ? "hide" : "show"]();
					}

					if (combo.getSelectedKey().length === 0) {

						combo.attachSelectionChange(
							function(oEvent) {
								var selected = oEvent.getSource().getSelectedKey();

								if (selected === "3") {
									oUrl.show();
									form.hide();
								}

								if (selected === "2") {
									oUrl.hide();
									form.show();
								}
							}
						);

						var css = "width:280px !important";

						$(upload[0]).attr("style", $(upload[0]).attr("style") + ";" + css + ";");
						upload.css({
							height: 40
						});

						combo.setSelectedKey(2);
						oUrl.hide();
						form.show();
					}
				}
			};

			this.oDialog.onAfterRendering = function() {
				afterRenderingSuper();
				this.fixUI(true, true, true);
			};

			var comboboxes = this.valueHelpersMetaData[this.tableName].combobox || {};
			this.comboCounter = Object.keys(comboboxes).length;
			var oData = this.getView().getModel("ObjectPageModel").getData();
			var readData = oData[window.generalNameSpace.businessObject.semanticObject];
			var receiveContentFromBackend;
			$.each(comboboxes, function(key) {
				receiveContentFromBackend = !this.isComboxValuesLoaded(readData, comboboxes[key].CollectionPath);
				if (receiveContentFromBackend) {
					this.showBusyIndicator();
					var opts = {
						viewData: viewData,
						readData: readData,
						combobox: comboboxes[key],
						upadetDataCallback: updateModel.bind({
							oViewModel: oViewModel,
							scope: this
						})
					};
					this.getComboBoxValues(opts);
				} else {
					viewData[comboboxes[key].CollectionPath] = readData[comboboxes[key].CollectionPath];
				}
			}.bind(this));
			///
			oViewModel.setData(this.viewData[this.tableName]);
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oDialog);
			this.oDialog.open();
		},

		resetFormForDialog: function(data) {
			var i;
			for (i in data) {
				if (data.hasOwnProperty(i)) {
					data[i] = null;
				}
			}
		},

		handleFileSelect: function handleFileSelect(oEvent) {

			if (window.File && window.FileReader && window.FileList && window.Blob) {
				// Great success! All the File APIs are supported.

				// Get file
				var file = oEvent.oSource.oFileUpload.files[0];

				if (typeof(file) === "undefined") {
					return false;
				}

				// Define reader and base64
				var reader = new FileReader();

				reader.onloadend = function(evt) {
					if (evt.target.readyState === this.reader.DONE) {

						var chars = new Uint8Array(evt.target.result);
						var CHUNK_SIZE = 0x8000;
						var index = 0;
						var length = chars.length;
						var result = "";
						var slice;
						while (index < length) {
							slice = chars.subarray(index, Math.min(index + CHUNK_SIZE, length));
							result += String.fromCharCode.apply(null, slice);
							index += CHUNK_SIZE;
						}
						this.scope.viewData[this.scope.tableName].Binary =
							window.btoa(result);
						// evt.target.result.match(/base64,(.+)/)[1];
					}
				}.bind({
					scope: this,
					reader: reader
				});

				reader.readAsArrayBuffer(file);
				// reader.readAsDataURL(
				//     file.slice(0, file.size - 1)
				// );

				this.viewData[this.tableName].MimeType = file.type;

			}
		},

		isValidAddUpdateForm: function isValidAddUpdateForm(isAdd) {
			var fragment = sap.ui.getCore().byId((this.tableName + (isAdd ? "_Form" : "_UpdateForm")));
			var isValid = this.isValidFormInFragment(fragment);
			return isValid;
		},

		confirmAdd: function confirmAdd() {
			if (!this.isValidAddUpdateForm(true)) {
				return;
			}

			var itemtoAdd = {};
			var addData = {};
			var viewData = this.oDialog.getModel().getData();
			$.each(viewData, function(key, value) {
				if (typeof(value) === "string") {
					itemtoAdd[key] = value;
				}
			});
			this.handleExit();

			///temporary populateItem

			addData.tableName = this.tableName;
			var oModelDetailsPage = this.getView().getModel(this.modelName);
			var dataDetailsPage = oModelDetailsPage.getData();
			itemtoAdd.ParentObjectID = dataDetailsPage[window.generalNameSpace.businessObject.semanticObject].ObjectID;
			//////////////////////////////

			addData.itemToAdd = itemtoAdd;
			this.showBusyIndicator();

			BackendCall.doCall({
				successCallback: this.onAddSuccess.bind({
					scope: this,
					data: addData
				}),
				errorCallback: this.onError.bind({
					scope: this
				}),
				completeCallback: this.onAddComplete.bind({
					scope: this
				}),
				method: "POST",
				data: JSON.stringify(addData.itemToAdd),
				url: window.generalNameSpace.businessObject.oDataService + "/" + addData.tableName + "Collection",
				contentType: "application/json;charset=utf-8"
			});
		},

		onAddComplete: function onAddComplete() {
			this.scope.hideBusyIndicator();
		},

		onAddSuccess: function onAddSuccess(xmlDoc) {
			var props = $(xmlDoc).find("m\\:properties, properties").children();
			this.scope.addRowFromResponse(this.scope, this.data, props);
			//add toastMessage
			var bundle = this.scope.getView().getModel("i18n_Static").getResourceBundle();
			sap.m.MessageToast.show(bundle.getText("starterDetailsPage.dialog.create.record"));

			this.scope.handleEditBtn(
				this.scope.getView().getModel("ObjectPageModel").getData()[this.data.tableName],
				sap.ui.getCore().byId(this.scope.getView().$().find("button.deleteBtn").attr("id"))
			);
			this.scope.editButtonEnabled(
				this.scope.getView().getModel("ObjectPageModel").getData()[this.data.tableName],
				sap.ui.getCore().byId(this.scope.getView().$().find("button.updateBtn").attr("id"))
			);
		},

		confirmUpdate: function confirmUpdate() {
			if (!this.isValidAddUpdateForm(false)) {
				return;
			}
			var itemtoUpdate = {};
			var updateData = {};
			var viewData = this.oDialog.getModel().getData();
			$.each(viewData, function(key, value) {
				if (typeof(value) === "string") {
					//verify that this is updatable field
					itemtoUpdate[key] = value;
				}
			});
			this.handleExit();

			updateData.tableName = this.tableName;
			var oModelDetailsPage = this.getView().getModel(this.modelName);
			var dataDetailsPage = oModelDetailsPage.getData();

			updateData.index = this.oDialog.editRowIndex;
			var objectId = itemtoUpdate.ObjectID;
			updateData.itemtoUpdate = itemtoUpdate;
			updateData.ParentObjectID = dataDetailsPage[window.generalNameSpace.businessObject.semanticObject].ObjectID;
			this.showBusyIndicator();

			BackendCall.doCall({
				successCallback: this.onUpdateFacetRowSuccess.bind({
					scope: this,
					data: updateData
				}),
				errorCallback: this.onError.bind({
					scope: this
				}),
				completeCallback: this.onAddComplete.bind({
					scope: this
				}),
				method: "PUT",
				data: JSON.stringify(updateData.itemtoUpdate),
				url: window.generalNameSpace.businessObject.oDataService + "/" + updateData.tableName + "Collection('" + objectId + "')",
				contentType: "application/json;charset=utf-8"
			});
		},

		onUpdateFacetRowSuccess: function _onAddSuccess() {
			this.scope.updateRow(this.scope, this.data);
			var bundle = this.scope.getView().getModel("i18n_Static").getResourceBundle();
			sap.m.MessageToast.show(bundle.getText("starterDetailsPage.dialog.facetUpdate.record"));
			this.scope.editButtonEnabled(
				this.scope.getView().getModel("ObjectPageModel").getData()[this.data.tableName],
				sap.ui.getCore().byId(this.scope.getView().$().find("button.updateBtn").attr("id"))
			);
		},

		updateRow: function(scope, data) {
			var item = data.itemtoUpdate;
			var oModel = scope.getView().getModel(scope.modelName),
				modelData = oModel.getData(),
				items = modelData[data.tableName];
			items[data.index] = item;
			oModel.setData(modelData);
		},

		enableDelete: function enableDelete(oEvent) {
			var oTable = this.getOTable(oEvent),
				oButton = oEvent.getSource(),
				$btn = oButton.$().find("div:first"),
				add = $btn.parents("div[id*=toolbar]:first").find(".addBtn"),
				edit = $btn.parents("div[id*=toolbar]:first").find(".updateBtn"),
				oAddButton = sap.ui.getCore().byId(add.attr("id")),
				oEditButton = sap.ui.getCore().byId(edit.attr("id")),
				isDeleteMode = oTable.getMode() === "Delete";

			if (isDeleteMode) {
				this.disableEdit(oEvent);
			} else {
				oTable.setMode("Delete");
			}

			$btn[isDeleteMode ? "removeClass" : "addClass"]("btnActive");

			if (oAddButton) {
				oAddButton.setEnabled(isDeleteMode);
			}

			if (oEditButton) {
				oEditButton.setEnabled(isDeleteMode);
			}
		},
		enableEdit: function enableEdit(oEvent) {
			var oTable = this.getOTable(oEvent),
				oButton = oEvent.getSource(),
				btnEdit = oButton.$().find("div:first"),
				add = btnEdit.parents("div[id*=toolbar]:first").find(".addBtn"),
				odelete = btnEdit.parents("div[id*=toolbar]:first").find(".deleteBtn"),
				oAddButton = sap.ui.getCore().byId(add.attr("id")),
				oDeleteButton = sap.ui.getCore().byId(odelete.attr("id"));
			var mode = this.getFacetState(this.tableName);
			var isEditMode = (mode === "edit");
			var oTableColumns = oTable.getColumns();
			if (isEditMode) {
				//button Edit pressed click on button disable Edit
				oTableColumns[oTableColumns.length - 1].setVisible(false);
				this.setFacetState(this.tableName, "view");
			} else {
				oTableColumns[oTableColumns.length - 1].setVisible(true);
				this.setFacetState(this.tableName, "edit");
			}

			btnEdit[isEditMode ? "removeClass" : "addClass"]("btnActive");

			if (oAddButton) {
				oAddButton.setEnabled(isEditMode);
			}

			if (oDeleteButton) {
				oDeleteButton.setEnabled(isEditMode);
			}
		},
		disableEdit: function disableEdit(oEvent) {
			var oTable = this.getOTable(oEvent);
			oTable.setMode("None");
		},

		setFacetState: function(tableName, state) {
			var facetsStateModel = this.getView().getModel("facetStateModel"),
				modelFacetsStateData = facetsStateModel.getData();
			modelFacetsStateData[tableName] = modelFacetsStateData[tableName] || {};
			modelFacetsStateData[tableName].state = state;
			facetsStateModel.setData(modelFacetsStateData);
		},

		getFacetState: function() {
			var facetsStateModel = this.getView().getModel("facetStateModel"),
				modelFacetsStateData = facetsStateModel.getData();
			return modelFacetsStateData[this.tableName].state;
		},

		editButtonEnabled: function(items, oEditButton) {

			if (!oEditButton) {
				return false;
			}

			var oTable = sap.ui.getCore().byId(jQuery("." + this.tableName)[0].id);
			var isDeleteMode = false;
			if (oTable.getMode && oTable.getMode() === "Delete") {
				isDeleteMode = true;
			}

			var length = items.length > 0;

			oEditButton.setEnabled(length && !isDeleteMode);
			var $btn = oEditButton.$().find("div:first");
			if (this.getFacetState() === "edit") {
				$btn.addClass("btnActive");
			} else {
				$btn.removeClass("btnActive");
			}
		},
		onEditFacetItem: function onEditFacetItem(oEvent) {
			this.dialogType = "updateFacetRow";
			var fragmentName = "c4c.details-appointmentcollection.local.view.dialog." + this.tableName + "Update";
			this.oDialog = sap.ui.xmlfragment(fragmentName, this);
			this.getView().addDependent(this.oDialog);

			var oViewModel = new sap.ui.model.json.JSONModel();
			var path = oEvent.oSource.oPropagatedProperties.oBindingContexts.ObjectPageModel.sPath;
			var idx = parseInt(path.substring(path.lastIndexOf("/") + 1), 10);
			var data = this.getView().getModel(this.modelName).getData();
			var items = data[this.tableName];
			var currentRow = jQuery.extend({}, items[idx]);

			function updateModel() {
				var currentVal = this.currentRow[this.key];
				this.currentRow[this.combobox.CollectionPath].Value = this.scope.getSelectedValueOfComboBox(currentVal, this.currentRow[this.combobox
					.CollectionPath]);
				this.oViewModel.setData(this.currentRow);
			}

			var comboboxes = this.valueHelpersMetaData[this.tableName].combobox || {};
			this.comboCounter = Object.keys(comboboxes).length;
			var oData = this.getView().getModel("ObjectPageModel").getData();
			var readData = oData[window.generalNameSpace.businessObject.semanticObject];
			var receiveContentFromBackend;
			jQuery.each(comboboxes, function(key) {
				receiveContentFromBackend = !this.isComboxValuesLoaded(readData, comboboxes[key].CollectionPath);
				if (receiveContentFromBackend) {
					this.showBusyIndicator();
					var opts = {
						viewData: currentRow,
						readData: readData,
						combobox: comboboxes[key],
						upadetDataCallback: updateModel.bind({
							oViewModel: oViewModel,
							currentRow: currentRow,
							key: key,
							combobox: comboboxes[key],
							scope: this
						})
					};
					this.getComboBoxValues(opts);
				} else {
					currentRow[comboboxes[key].CollectionPath] = readData[comboboxes[key].CollectionPath];
					var currentVal = currentRow[key];
					currentRow[comboboxes[key].CollectionPath].Value = this.getSelectedValueOfComboBox(currentVal, currentRow[comboboxes[key].CollectionPath]);
				}
			}.bind(this));

			oViewModel.setData(currentRow);
			oViewModel.setSizeLimit(260);

			this.oDialog.setModel(oViewModel);
			this.oDialog.editRowIndex = idx;

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oDialog);
			this.oDialog.open();
		},

		isComboxValuesLoaded: function isComboxValuesLoaded(readData, entityCollection) {
			var notExist = (typeof(readData[entityCollection]) === "undefined" && typeof(readData[entityCollection + "Value"]) === "undefined");
			return !notExist;
		},

		getSelectedValueOfComboBox: function getSelectedValueOfComboBox(currentVal, data) {
			for (var i = 0, l = data.length; i < l; i++) {
				if (data[i].Code === currentVal) {
					return data[i].Description;
				}
			}
		},
		formFragments: {},
		getFormFragment: function(sFragmentName) {

			var oFormFragment = this.formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(
				this.getView().getId(),
				"c4c.details-appointmentcollection.local.view.details" + sFragmentName,
				this
			);
			this.formFragments[sFragmentName] = oFormFragment;
			return this.formFragments[sFragmentName];
		},

		handleOverviewEdit: function enableOverviewEdit(oEvent) {
			var oButton = oEvent.getSource();

			if (oButton.isActive()) {
				this.overViewEdit = oButton;
				this.enableOverviewEdit(oEvent);
			}
		},

		showHideConfirmCancelBtns: function showHideConfirmCancelBtns(oEvent, showConfirmCancel) {
			var toolBar = oEvent.getSource().getParent();
			var toolBarChildren = toolBar.getAggregation("content");
			var i;

			for (i = 0; i < toolBarChildren.length; i++) {
				if (toolBarChildren[i].hasStyleClass("cancelBtn") || toolBarChildren[i].hasStyleClass("confirmBtn")) {
					toolBarChildren[i].setVisible(showConfirmCancel);
				} else if (toolBarChildren[i].hasStyleClass("edit-overview")) {
					toolBarChildren[i].setVisible(!showConfirmCancel);
				}
			}
		},

		enableOverviewEdit: function enableOverviewEdit(oEvent) {
			this.setDataToEditOverview();
			var oButton = oEvent.getSource();

			this.showHideConfirmCancelBtns(oEvent, true);

			var vLayout = sap.ui.getCore().byId(oButton.getParent().$().next()[0].id);

			vLayout.removeAllContent();
			vLayout.insertContent(
				this.getFormFragment("Edit")
			);
		},
		setDataToEditOverview: function setDataToEditOverview() {
			var oData = this.getView().getModel("ObjectPageModel").getData();
			var readData = oData[window.generalNameSpace.businessObject.semanticObject];
			var bo = window.generalNameSpace.businessObject.semanticObject;
			var editData = this.viewData[bo];
			var oEditModel = new sap.ui.model.json.JSONModel();
			oEditModel.setSizeLimit(260);
			var comboboxes = this.valueHelpersMetaData[bo].combobox || {};
			this.comboCounter = Object.keys(comboboxes).length;

			function updateModel() {
				var boName = {};
				boName[window.generalNameSpace.businessObject.semanticObject] = this.editData;
				this.oEditModel.setData(boName);
				this.scope.getView().setModel(this.oEditModel, "EditObjectPageModel");
			}

			$.each(editData, function(key) {

				var currentValue = readData[key];
				var receiveContentFromBackend;

				editData[key] = currentValue;

				if (comboboxes[key]) {
					receiveContentFromBackend = !this.isComboxValuesLoaded(readData, comboboxes[key].CollectionPath);
					if (receiveContentFromBackend) {
						this.showBusyIndicator();

						var opts = {
							viewData: editData,
							readData: readData,
							combobox: comboboxes[key],
							currentValue: currentValue,
							upadetDataCallback: updateModel.bind({
								scope: this,
								editData: editData,
								oEditModel: oEditModel
							})
						};
						this.getComboBoxValues(opts);
					} else {

						editData[comboboxes[key].CollectionPath] = readData[comboboxes[key].CollectionPath];
						editData[comboboxes[key].CollectionPath + "Value"] = readData[comboboxes[key].CollectionPath + "Value"];
					}
				}
			}.bind(this));

			updateModel.bind({
				scope: this,
				editData: editData,
				oEditModel: oEditModel
			})();
		},
		disableOverviewEdit: function disableOverviewEdit(oEvent) {
			var oButton = oEvent.getSource();

			this.showHideConfirmCancelBtns(oEvent, false);

			var vLayout = sap.ui.getCore().byId(oButton.getParent().$().next()[0].id);

			vLayout.removeAllContent();
			vLayout.insertContent(
				this.getFormFragment("Display")
			);

		},

		getFormView: function getFormView() {
			return this.getView().byId("AppointmentCollection_Form");
		},

		handleConfirmEdit: function handleConfirmEdit(oEvent) {

			if (!this.isValidForm()) {
				return;
			}
			var oModel = this.getView().getModel("ObjectPageModel").getData();
			var readData = oModel[window.generalNameSpace.businessObject.semanticObject];
			var oEditModel = this.getView().getModel("EditObjectPageModel").getData();

			var editData = oEditModel[window.generalNameSpace.businessObject.semanticObject];
			//this.viewData[window.generalNameSpace.businessObject.semanticObject];

			var currentValue;
			var updateData = {};

			var postData = {};
			var updateFieldsName = this.updateFields;

			jQuery.each(readData, function(key, value) {

				if ($.inArray(key, updateFieldsName) !== -1) {

					if (typeof(value) === "string") {

						if (typeof editData[key] !== "undefined") {
							currentValue = editData[key];
						} else {
							currentValue = readData[key];
						}

						postData[key] = currentValue;
					}
				}
			});

			updateData.data = postData;
			updateData.editedData = editData;
			updateData.ObjectID = readData.ObjectID;
			updateData.event = oEvent;

			this.showBusyIndicator();

			BackendCall.doCall({
				successCallback: this.onUpdateSuccess.bind({
					scope: this,
					data: updateData
				}),
				errorCallback: this.onError.bind({
					scope: this
				}),
				completeCallback: this.onUpdateComplete.bind({
					scope: this,
					source: oEvent.getSource()
				}),
				data: JSON.stringify(updateData.data),
				method: "PUT",
				url: window.generalNameSpace.businessObject.oDataService + "/" + window.generalNameSpace.businessObject.semanticObject +
					"Collection" + "('" + updateData.ObjectID + "')",
				contentType: "application/json;charset=utf-8"
			});
		},

		onUpdateComplete: function onUpdateComplete() {
			var source = this.source;
			this.scope.disableOverviewEdit({
				getSource: function() {
					return source;
				}
			});
			this.scope.hideBusyIndicator();
		},

		onUpdateSuccess: function onUpdateSuccess() {
			var oModel = this.scope.getView().getModel("ObjectPageModel");
			var modelData = oModel.getData();
			var readData = modelData[window.generalNameSpace.businessObject.semanticObject];
			var editData = this.data.editedData;

			$.each(editData, function(key) {
				var currentValue = editData[key];
				readData[key] = currentValue;
			});
			modelData[window.generalNameSpace.businessObject.semanticObject] = readData;
			oModel.setData(modelData);

			var bundle = this.scope.getView().getModel("i18n_Static").getResourceBundle();
			sap.m.MessageToast.show(bundle.getText("starterDetailsPage.dialog.update.record"));
		},

		handleCancelEdit: function handleCancelEdit(oEvent) {
			delete this.overViewEdit;
			this.disableOverviewEdit(oEvent);
			this.resetForm();
		},

		getOTable: function getOTable(oEvent) {
			this.setEditableContext(oEvent.getSource());
			return sap.ui.getCore().byId(jQuery("." + this.tableName)[0].id);
		},

		setEditableContext: function(src) {
			this.tableName = src.data("table");
			this.modelName = src.data("model");
		},

		restoreRow: function(scope, data) {
			var item = data.deletedItem;
			var oModel = scope.getView().getModel(scope.modelName),
				modelData = oModel.getData(),
				items = modelData[data.tableName];
			items.splice(data.indexDeletedItem, 0, item);
			oModel.setData(modelData);
		},

		addRowFromResponse: function(scope, data, props) {
			var oModel = scope.getView().getModel(scope.modelName),
				modelData = oModel.getData(),
				items = modelData[data.tableName];
			var item = {};
			jQuery.each(props, function() {
				var n = this.nodeName;
				var propName = n.split(":")[1];
				item[propName] = $(this).text();
			});
			items.splice(data.indexDeletedItem, 0, item);
			oModel.setData(modelData);

			var oCountModel = scope.getView().getModel("tableCountModel"),
				modelCountData = oCountModel.getData();
			modelCountData[data.tableName + "Count"] = items.length;
			oCountModel.setData(modelCountData);
		},

		updateBOAfterChange: function(xmlDoc, status) {
			if (status === "success") {
				var props = $(xmlDoc).find("m\\:properties, properties").children();
				var oModel = this.scope.getView().getModel(this.scope.modelName);
				var modelData = oModel.getData();
				var item = {};
				jQuery.each(props, function() {
					var n = this.nodeName;
					var propName = n.split(":")[1];
					item[propName] = $(this).text();
				});
				//modelData[this.scope.tableName] = item;
				modelData[window.generalNameSpace.businessObject.semanticObject] = item;
				oModel.setData(modelData);

				var bundle = this.scope.getView().getModel("i18n_Static").getResourceBundle();
				sap.m.MessageToast.show(bundle.getText("starterDetailsPage.action.success.notification"));
			}

			this.scope.hideBusyIndicator();
		},

		fnDateTimeFormatter: function fnDateTimeFormatter(value) {
			var oValue = value + "";
			if (typeof(oValue) !== "undefined" && oValue.length !== 0) {
				return new Date(oValue);
			}
		},

		formatDate: function(date) {
			if (typeof date === "undefined") {
				return "";
			}

			var dateFormat = sap.ui.core.format.DateFormat.getInstance({
				style: "long"
			});
			return dateFormat.format(new Date(date));
		},

		formatTimeDate: function(date) {
			if (typeof date === "undefined") {
				return "";
			}

			var dateTimeFormat = sap.ui.core.format.DateFormat.getDateTimeInstance();
			return dateTimeFormat.format(new Date(date));
		},

		getObjectIdByFunctionImport: function(functionImport, callback) {
			var url = window.generalNameSpace.businessObject.oDataService + "/" + functionImport;

			BackendCall.doCall({
				successCallback: this.onSuccess.bind({
					callback: callback
				}),
				errorCallback: this.onError.bind({
					scope: this
				}),
				method: "GET",
				url: url,
				contentType: "application/atom+xml;type=entry; charset=utf-8"
			});
		},

		onSuccess: function onSuccess(data) {
			var id = $(data).find("d\\:ObjectID, ObjectID").text();
			this.callback(id);
		},

		onError: function onError(xhr) {
			if (this.callBefore) {
				this.callBefore(null);
			}

			var errorMessage,
				bundle = this.scope.getView().getModel("i18n_Static").getResourceBundle(),
				bodyError = bundle.getText("dialog.body.error"),
				title = "";

			try {
				var xmlObject = xhr.responseXML || xhr.response.body;
				var errorDoc = $(xmlObject);
				var error = errorDoc.find("message");
				errorMessage = error.text() || bodyError;
			} catch (err) {
				errorMessage = bodyError;
			}

			title = bundle.getText("dialog.title.error");
			this.scope.hideBusyIndicator();
			sap.m.MessageBox.show(errorMessage, {
				title: title,
				icon: sap.m.MessageBox.Icon.ERROR
			});
		},

		getFirstRowID: function(callback) {
			BackendCall.doCall({
				successCallback: this.onSuccess.bind({
					callback: callback
				}),
				errorCallback: this.onError.bind({
					callBefore: callback,
					scope: this

				}),
				method: "GET",
				url: window.generalNameSpace.businessObject.oDataService + "/" + window.generalNameSpace.businessObject.targetEntity +
					"?$skip=0&$top=1",
				contentType: "application/atom+xml;type=entry; charset=utf-8"
			});
		},

		handleComboChange: function handleComboChange(oEvent) {
			var src = oEvent.getSource(),
				name = src.getName();

			var text = "Text";
			if (this.dialogType) {
				var viewData = this.oDialog.getModel().getData();
				viewData[name] = src.getSelectedKey();
				if (this.dialogType === "updateFacetRow") {
					// Text model sync
					if (name.indexOf(text) + text.length !== name.length) {
						viewData[name + text] = src.getSelectedItem().getText();
					}
				}
			} else {
				// it is edit overview case
				var oModel = this.getView().getModel("EditObjectPageModel").getData();
				var editData = oModel[window.generalNameSpace.businessObject.semanticObject];

				editData[name] = src.getSelectedKey();
				// Text model sync
				if (name.indexOf(text) + text.length !== name.length) {
					editData[name + text] = src.getSelectedItem().getText();
				}

			}
		},

		handleDateChange: function handleDateChange(oEvent) {

			function getDate(value) {
				var date = value.getDate();
				return date < 10 ? "0" + date : date;
			}

			function getMonth(value) {
				var month = value.getMonth() + 1;
				return month < 10 ? "0" + month : month;
			}

			function getTime(value) {
				return value.toTimeString().match(/\d{2}:\d{2}:\d{2}/)[0];
			}

			function getDateTime(value, timestamp) {
				var date = value.getFullYear() + "-" + getMonth(value) + "-" + getDate(value);
				var time = timestamp ? getTime(value) : "00:00:00";
				return date + "T" + time + ".000";
			}

			var src = oEvent.getSource(),
				value = src.getValue(),
				name = src.getName();

			var oModel = this.getView().getModel("EditObjectPageModel").getData(),
				editData = oModel[window.generalNameSpace.businessObject.semanticObject];

			if (src.$().hasClass("sap-datepicker")) {
				value = getDateTime(src.getDateValue(), false);
			}

			if (src.$().hasClass("sap-datetimepicker")) {
				value = getDateTime(src.getDateValue(), true);
			}

			editData[name] = value;
		},

		getComboBoxValues: function getComboBoxValues(opts) {
			var viewData = opts.viewData,
				readData = opts.readData,
				combobox = opts.combobox,
				currentValue = opts.currentValue,
				upadetDataCallback = opts.upadetDataCallback;
			BackendCall.doCall({
				successCallback: function(xml) {
					var data = $(xml).find("m\\:properties, properties"),
						collection = [];
					var value;
					for (var i = 0, l = data.length; i < l; i++) {
						var code = $(data[i]).find("d\\:Code, Code").text(),
							desc = $(data[i]).find("d\\:Description, Description").text();
						if (currentValue && code === currentValue) {
							value = desc;
						}
						if (!(this.url.match(/AttachmentCategoryCode/) && code === "1")) {
							collection.push({
								Code: code,
								Description: desc
							});
						}
					}
					collection.sort(function(obj1, obj2) {
						if (obj1.Description > obj2.Description) {
							return 1;
						}
						if (obj1.Description < obj2.Description) {
							return -1;
						}
						return 0;

					});
					viewData[combobox.CollectionPath] = collection;
					readData[combobox.CollectionPath] = collection;

					if (currentValue) {
						viewData[combobox.CollectionPath + "Value"] = value;
						readData[combobox.CollectionPath + "Value"] = value;
					}
					upadetDataCallback();
				},
				errorCallback: this.onError.bind({
					scope: this
				}),
				completeCallback: function() {
					this.comboCounter -= 1;

					if (this.comboCounter === 0) {
						this.hideBusyIndicator();
					}
				}.bind(this),
				method: "GET",
				url: window.generalNameSpace.businessObject.oDataService + "/" + combobox.CollectionPath + "Collection",
				contentType: "application/json;charset=utf-8"
			});
		}
	});
}());