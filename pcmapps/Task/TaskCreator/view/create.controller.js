(function() {
	"use strict";
	/*global  jQuery, $, sap, window, BackendCall*/
	jQuery.sap.require("sap.m.MessageBox");
	sap.ui.controller("c4c.create-TaskCollection.remote.view.create", {

		// implement an event handler in the Controller

		busyDialog: null,

		eventBus: null,

		valueHelpersMetaData: {
			"AccountID_578": {
				"CollectionPath": "Account",
				"searchSupported": false,
				"viewParams": {
					"AccountID": [
						"AccountID"
					],
					"AccountName": null
				},
				"filterable": [
					"AccountName",
					"AccountName1",
					"AccountName2",
					"Address",
					"CategoryCode",
					"CategoryCodeText",
					"Country",
					"CountryText",
					"Email",
					"EmployeeResponsible",
					"Mobile",
					"Phone",
					"Web"
				],
				"comboBox": false,
				"BusinessObject": "TaskCollection",
				"prefixKey": "CHP.Task.AccountID.Common.ValueList",
				"titleKey": "CHP.Task.UI.Identification.UI.DataField.AccountID",
				"fieldName": "AccountID"
			},
			"combobox": {
				"Category": {
					"CollectionPath": "TaskCategory",
					"searchSupported": false,
					"viewParams": {
						"Code": [
							"Category"
						],
						"Description": null
					},
					"filterable": [],
					"comboBox": true,
					"BusinessObject": "TaskCollection",
					"id": "Category_581"
				},
				"Priority": {
					"CollectionPath": "TaskPriority",
					"searchSupported": false,
					"viewParams": {
						"Code": [
							"Priority"
						],
						"Description": null
					},
					"filterable": [],
					"comboBox": true,
					"BusinessObject": "TaskCollection",
					"id": "Priority_582"
				}
			}
		},

		onInit: function() {
			var viewData = {

				"Subject": null,

				"AccountID": null,

				"TaskStartDateTime": null,

				"TaskDueDateTime": null,

				"Category": null,

				"Priority": null
			};
			var index;
			var oViewModel = new sap.ui.model.json.JSONModel();
			oViewModel.setSizeLimit(260);
			var oForm = this.getFormView();

			this.busyDialog = new sap.m.BusyDialog();
			this.eventBus = new sap.ui.core.EventBus();

			var comboboxes = this.valueHelpersMetaData.combobox || {},
				comboCounter = Object.keys(comboboxes).length;

			function getComboPath(field) {
				for (index in comboboxes) {
					if (comboboxes.hasOwnProperty(index) && field === index) {
						return comboboxes[index].CollectionPath;
					}
				}
			}

			function getComboBoxesData(eIndex) {

				var oBD = this.busyDialog;
				oBD.open();

				BackendCall.doCall({
					successCallback: function(xml) {
						var data = $(xml).find("m\\:properties, properties"),
							collection = [];

						for (var i = 0, l = data.length; i < l; i++) {

							var code = $(data[i]).find("d\\:Code, Code").text(),
								desc = $(data[i]).find("d\\:Description, Description").text();

							collection.push({
								Code: code,
								Description: desc
							});
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

						viewData[getComboPath(eIndex)] = collection;

						oViewModel.setData(viewData);

						oBD.close();

					},
					errorCallback: function(xhr) {
						this.onError(xhr);
					}.bind(this),
					completeCallback: function() {
						comboCounter -= 1;

						if (comboCounter === 0) {
							oBD.close();
						}
					},
					method: "GET",
					url: window.generalNameSpace.businessObject.oDataService + "/" + comboboxes[index].CollectionPath + "Collection",
					contentType: "application/json;charset=utf-8"
				});

			}

			for (index in comboboxes) {
				if (comboboxes.hasOwnProperty(index)) {
					delete viewData[index];
					getComboBoxesData.bind(this)(index);
				}
			}

			oForm.setModel(oViewModel);
			oViewModel.setData(viewData);

			this.registerEvents();
		},

		getFormView: function getFormView() {
			return this.getView().byId("TaskCollection_Form");
		},

		registerEvents: function registerEvents() {
			this.eventBus.subscribe("dialog.event", "value.changed", function(v, e, obj) {
				this.onValueHelpChanged(obj);
			}.bind(this));
		},

		onValueHelpChanged: function onValueHelpChanged(obj) {
			var formModel = this.getFormView().getModel(),
				updateData = {},
				i, j;
			if (this.inputFromValueHelp && this.inputFromValueHelp.getValueState() === "Error") {
				this.inputFromValueHelp.setValueState("None");
			}
			for (i in obj) {
				if (obj.hasOwnProperty(i)) {
					for (j = 0; j < obj[i].localsIds.length; j++) {
						updateData[obj[i].localsIds[j]] = obj[i].value;
					}
				}
			}

			formModel.setData(updateData, true);
		},
		isValidFormInFragment: function(fragment) {
			var input,
				inputId,
				isValid = true,
				that = this,
				bundle,
				labels = fragment.$().find(".sapMLabelRequired:visible");

			$.each(labels, function() {
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
			var fragment = this.getFormView();
			var isValid = this.isValidFormInFragment(fragment);
			return isValid;
		},

		resetForm: function() {
			var form = this.getFormView(),
				data = form.getModel().getData(),
				i;

			for (i in data) {
				if (data.hasOwnProperty(i)) {
					if (!$.isArray(data[i])) {
						data[i] = null;
					}
				}
			}

			var comboboxes = form.$().find(".sapMComboBox"),
				core = sap.ui.getCore();

			for (var j = 0, l = comboboxes.length; j < l; j++) {
				core.byId(comboboxes[j].id).setSelectedKey("");
			}

			this.getFormView().getModel().setData(data, true);
			var fragment = this.getFormView();
			var input = fragment.$().find(".sapMInputBaseErrorInner");
			var inputId;
			input.each(function(t, val) {
				inputId = val.id;
				inputId = inputId.indexOf("-inner") >= 0 ? inputId.substr(0, inputId.indexOf("-inner")) : inputId;
				input = sap.ui.getCore().byId(inputId);
				if (input.getType() === "Number") {
					input.setValue("0");
					input.setValue("");
				}
				input.setValueState("None");
			});
		},

		handleComboChange: function handleComboChange(oEvent) {

			this.viewDataCombo = this.viewDataCombo || {};

			var src = oEvent.getSource(),
				name = src.getName();

			this.viewDataCombo[name] = src.getSelectedKey();
		},
		handleRequiredInputChange: function handleComboChange(oEvent) {
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

		saveForm: function() {
			if (!this.isValidForm()) {
				return;
			}
			var form = this.getFormView();
			var oViewModel = form.getModel();
			var viewData = oViewModel.getData();
			var postData = {};

			var oBD = this.busyDialog;
			oBD.open();

			$.each(viewData, function(eKey, eValue) {
				var value = eValue,
					key = eKey;

				function getMonth(val) {
					var month = val.getMonth() + 1;
					return month < 10 ? "0" + month : month;
				}

				function getTime(val) {
					return val.toTimeString().match(/\d{2}:\d{2}:\d{2}/)[0];
				}

				function getDateTime(val, timestamp) {
					var date = val.getFullYear() + "-" + getMonth(val) + "-" + value.getDate();
					var time = timestamp ? getTime(val) : "00:00:00";
					return date + "T" + time + ".000";
				}

				if (value) {

					if (value instanceof Date) {
						//Remove "Z" from the end of the date format
						//value = value.toJSON().replace(/Z$/, "");
						value = getDateTime(value, false);
					} else {
						var control = sap.ui.getCore().byId(form.$().find("div[id*=" + key + "]").attr("id"));
						if (control && control.getType() === "DateTime") {
							value = new Date(value);
							value = getDateTime(value, true);
						}
					}

					if ($.isArray(value)) {
						this.viewDataCombo = this.viewDataCombo || {};
						key = key.replace(window.generalNameSpace.businessObject.semanticObject, "");
						value = this.viewDataCombo[key];
					}

					if (value) {
						postData[key] = value;
					}
				}
			}.bind(this));

			var that = this;

			BackendCall.doCall({
				url: window.generalNameSpace.appService + "/" + window.generalNameSpace.businessObject.targetEntity,
				data: JSON.stringify(postData),
				method: "POST",
				successCallback: function(xmlDoc, status, xhr) {
					var obundle = that.getView().getModel("i18n_Static").getResourceBundle();
					oBD.close();
					var objectID = $(xhr.responseXML).find("d\\:ObjectID, ObjectID").text();
					that.navigateToDetails(objectID);
					sap.m.MessageToast.show(
						obundle.getText(
							"starterCreateTemplate.create.success.notification",
							window.generalNameSpace.businessObject.semanticObject
						)
					);
				},
				errorCallback: function(xhr) {
					this.onError(xhr, true);
				}.bind(this),
				contentType: "application/json; charset=utf-8"
			});
		},

		navigateToDetails: function(objectDetailsId) {
			try {
				if (sap.ushell && sap.ushell.services && sap.ushell.services.AppConfiguration) {
					var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
					var semanticObjectValue = window.generalNameSpace.businessObject.semanticObject;
					oCrossAppNavigator.toExternal({
						target: {
							semanticObject: semanticObjectValue,
							action: "Details"
						},
						params: {
							objectId: objectDetailsId,
							createSuccessed: true
						}
					});

				}
			} catch (e) {
				//  this.showMsg("Object id:" + objectDetailsId);
			}
		},

		getServiceUrl: function(query) {
			return ["/", window.generalNameSpace.pathToDestination, query].join('');
		},

		cancelForm: function() {
			var bundle = this.getView().getModel("i18n_Static").getResourceBundle();
			var title = bundle.getText("starterCreateTemplate.create.cancelForm.title");
			var description = bundle.getText("starterCreateTemplate.create.cancelForm.description");
			sap.m.MessageBox.show(description, {
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				title: title,
				onClose: function(oAction) {
					if (oAction === sap.m.MessageBox.Action.YES) {
						//this.resetForm();
						this.backNavigate();
					}
				}.bind(this)
			});
		},
		backNavigate: function() {
			try {
				if (sap.ushell.services.AppConfiguration) {
					window.history.go(-1);
				}
			} catch (e) {}
			return;
		},
		openValueHelpDialog: function openValueHelpDialog(oController) {
			this.inputFromValueHelp = oController.getSource();
			var valueHelpMetaData = this.valueHelpersMetaData[oController.getSource().getId().replace(this.getView().getId() + "--", "")];

			valueHelpMetaData.searchValue = oController.getSource()._$input.val();
			var oValueHelpDialog = sap.ui.controller("c4c.create-TaskCollection.remote.view.vhelpdialog");
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
		onError: function(xhr, isCreateAction) {

			var bundle = this.getView().getModel("i18n_Static").getResourceBundle();
			var errTitle = bundle.getText("dialog.title.error");
			var errMessage;
			try {
				var errorDoc = $(xhr.responseXML);
				var error = errorDoc.find("message");
				errMessage = error.text();
			} catch (err) {
				if (isCreateAction) {
					errMessage = bundle.getText("starterCreateTemplate.create.error.notification");
				} else {
					errMessage = bundle.getText("dialog.body.error");
				}
			}
			this.busyDialog.close();
			sap.m.MessageBox.show(errMessage, {
				title: errTitle,
				icon: sap.m.MessageBox.Icon.ERROR
			});
		},

		formatTranslation: function(str) {
			var args = str.split(","),
				params = args.slice(1),
				view = this.getView(),
				staticBundle = view.getModel("i18n_Static").getResourceBundle(),
				bundle = view.getModel("i18n").getResourceBundle(),
				i;

			for (i = 0; i < params.length; i++) {
				params[i] = bundle.getText(params[i]);
			}

			return staticBundle.getText(args[0], params);
		}

	});
}());