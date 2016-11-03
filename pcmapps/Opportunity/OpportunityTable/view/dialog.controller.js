(function() {
	"use strict";
	/*global  sap*/
	sap.ui.controller("c4c.table-opportunitycollection.remote.view.dialog", {
		eventBus: null,
		filterDateOperator: "BT",

		onInit: function() {
			var customData = this.getView().getViewData();
			this.filterMap = {};
			this.tableFilters = [];
			this.eventBus = customData.eventBus;
		},

		getDialog: function() {
			return this.getView().byId("c4cDialog");
		},

		onFilterChange: function(oEvent) {
			var columnId = oEvent.oSource.getName(),
				dialog = this.getDialog(),
				i,
				isDateType = false;
			if (oEvent.oSource.$().hasClass("sap-datetimepicker")) {
				isDateType = true;
				var fromValue, toValue;
				fromValue = oEvent.getParameters().from;
				toValue = oEvent.getParameters().to;
				if (fromValue === null && toValue === null) {
					delete this.filterMap[columnId];
				} else {
					fromValue = fromValue || toValue;
					toValue = toValue || fromValue;
					this.filterMap[columnId] = {};
					this.filterMap[columnId].fromValue = fromValue;
					this.filterMap[columnId].toValue = toValue;
					this.filterMap[columnId].isDateType = isDateType;
				}
			} else {
				var newSearchValue = oEvent.getParameters().newValue;
				if (newSearchValue === "") {
					delete this.filterMap[columnId];
				} else {
					this.filterMap[columnId] = {};
					this.filterMap[columnId].value = "'" + newSearchValue + "'";
					this.filterMap[columnId].isDateType = isDateType;
				}
			}
			for (i = 0; i < dialog.getFilterItems().length; i++) {
				if (dialog.getFilterItems()[i].mProperties.key === columnId) {
					if (dialog.getFilterItems()[i].getCustomControl().mProperties.valueFormat) {
						//Date
						if (oEvent.getParameters().from === null && oEvent.getParameters().to === null) {
							dialog.getFilterItems()[i].setFilterCount(0);
						} else {
							dialog.getFilterItems()[i].setFilterCount(1);
						}
					} else {
						//Label
						if (oEvent.getParameters().newValue === "") {
							dialog.getFilterItems()[i].setFilterCount(0);
						} else {
							dialog.getFilterItems()[i].setFilterCount(1);
						}
					}
				}
			}
		},

		resetTableFilters: function(eraseTableFilters) {
			var dialog = this.getDialog(),
				i;

			if (eraseTableFilters) {
				this.tableFilters = [];
			}

			this.filterMap = {};
			for (i = 0; i < dialog.getFilterItems().length; i++) {
				if (dialog.getFilterItems()[i].getCustomControl().mProperties.valueFormat) {
					//Date
					dialog.getFilterItems()[i].setFilterCount(0);
					dialog.getFilterItems()[i].getCustomControl().setDateValue(null);
					dialog.getFilterItems()[i].getCustomControl().setSecondDateValue(null);
				} else {
					//Label
					dialog.getFilterItems()[i].setFilterCount(0);
					dialog.getFilterItems()[i].getCustomControl().setValue("");
				}
			}

		},

		hasFilters: function() {
			return this.filterMap ? true : false;
		},

		getCurrentFilters: function() {
			var key, i, aFilters = [],
				dialog = this.getDialog(),
				modelFilter = null,
				upperCaseFilter = null,
				lowerCaseFilter = null,
				isMultifilter = false,
				multiFilterArr = [],
				multiFilter = null,
				infoBarValue,
				masterFilter = null;

			this.tableFilters = [];
			this.infobarFiltersMap = {};
			for (key in this.filterMap) {
				if (this.filterMap.hasOwnProperty(key)) {
					for (i = 0; i < dialog.getAggregation("filterItems").length; i++) {
						if (key === dialog.getAggregation("filterItems")[i].getProperty("key")) {
							if (this.filterMap[key].isDateType) {
								infoBarValue = this.filterMap[key].fromValue.toString().substr(4, 11) + " - " + this.filterMap[key].toValue.toString().substr(4,
									11);
							} else {
								infoBarValue = this.filterMap[key].value;
							}
							this.infobarFiltersMap[dialog.getAggregation("filterItems")[i].getProperty("text")] = infoBarValue;
							break;
						}
					}
					if (!this.filterMap[key].isDateType && this.filterMap[key].value.indexOf("*") > -1) {
						var arr = this.filterMap[key].value.split("*");
						if (arr[0] === "") {
							arr.splice(0, 1);
						}
						if (arr[arr.length - 1] === "") {
							arr.splice(arr.length - 1, 1);
						}
						this.filterMap[key].value = arr.join("*");
					}
					if (key.indexOf("@") === -1) {
						//single field
						aFilters = [];
						masterFilter = null;
						if (this.filterMap[key].isDateType) {
							masterFilter = new sap.ui.model.Filter(key, this.filterDateOperator, this.filterMap[key].fromValue, this.filterMap[key].toValue);
						} else {
							modelFilter = new sap.ui.model.Filter(key, "Contains", this.filterMap[key].value);
							upperCaseFilter = new sap.ui.model.Filter(key, "Contains", this.filterMap[key].value.toUpperCase());
							lowerCaseFilter = new sap.ui.model.Filter(key, "Contains", this.filterMap[key].value.toLowerCase());
							aFilters.push(modelFilter);
							aFilters.push(upperCaseFilter);
							aFilters.push(lowerCaseFilter);
							masterFilter = new sap.ui.model.Filter(aFilters, false);
						}

						if (!Object.keys) {
							Object.keys = function(obj) {
								var keys = [];
								for (var j in obj) {
									if (obj.hasOwnProperty(j)) {
										keys.push(j);
									}
								}
								return keys;
							};
						}
						if (Object.keys(this.filterMap).length > 1) {
							isMultifilter = true;
							multiFilterArr.push(masterFilter);
						}
					} else {
						//concat field
						var strArr = key.split("@"),
							firstFilter = null,
							secondFilter = null,
							intValue = null,
							strValue = "";

						intValue = this.filterMap[key].value.replace(new RegExp(/\'/g), "").replace(new RegExp(/\D/g), "");
						strValue = this.filterMap[key].value.replace(new RegExp(/\'/g), "").replace(new RegExp(/\d/g), "");
						if (intValue !== "") {
							firstFilter = new sap.ui.model.Filter(strArr[0], "EQ", intValue);
							this.tableFilters.push(firstFilter);
						}
						if (strValue !== "") {
							secondFilter = new sap.ui.model.Filter(strArr[1], "Contains", "'" + strValue + "'");
							this.tableFilters.push(secondFilter);
						}
					}
				}
			}
			if (isMultifilter) {
				multiFilter = new sap.ui.model.Filter(multiFilterArr, true);
				this.tableFilters.push(multiFilter);
			} else {
				if (masterFilter) {
					this.tableFilters.push(masterFilter);
				}
			}
			return {
				tableFilters: this.tableFilters,
				tableFiltersMap: this.infobarFiltersMap
			};
		},

		getSorters: function(oEvent) {
			var key, sorter, aSorters = [];
			key = oEvent.getParameters().sortItem.getKey();
			if (key.indexOf("@") === -1) {
				sorter = new sap.ui.model.Sorter(key, oEvent.getParameters().sortDescending);
				aSorters.push(sorter);
			} else {
				var strArr = key.split("@");
				var firstSorter = new sap.ui.model.Sorter(strArr[0], oEvent.getParameters().sortDescending);
				var secondSorter = new sap.ui.model.Sorter(strArr[1], oEvent.getParameters().sortDescending);
				aSorters.push(firstSorter);
				aSorters.push(secondSorter);
			}
			return aSorters;
		},

		confirmDialog: function(oEvent) {
			var obj = this.getCurrentFilters();
			obj.tableSorters = this.getSorters(oEvent);
			this.eventBus.publish("dailog.view", "apply.filter", obj);
		},

		revertOnCancel: function() {
			this.revertFilterElements(this.getDialog().getFilterItems());
			this.revertFilterMap();
		},

		revertFilterElements: function(dialogFilterElements) {
			var i, j,
				bool,
				uniqueFilters = this.getUniqueFilter();

			if (!this.tableFilters || this.tableFilters.length === 0) {
				for (i = 0; i < dialogFilterElements.length; i++) {
					if (dialogFilterElements[i].getCustomControl().mProperties.valueFormat) {
						//Date
						dialogFilterElements[i].setFilterCount(0);
						dialogFilterElements[i].getCustomControl().setDateValue(null);
						dialogFilterElements[i].getCustomControl().setSecondDateValue(null);
					} else {
						//Label
						dialogFilterElements[i].setFilterCount(0);
						dialogFilterElements[i].getCustomControl().setValue("");
					}
				}
			} else {
				for (i = 0; i < dialogFilterElements.length; i++) {
					bool = false;
					for (j = 0; j < uniqueFilters.length; j++) {
						if (uniqueFilters[j].sPath.localeCompare(dialogFilterElements[i].mProperties.key) === 0) {
							if (uniqueFilters[j].sOperator === this.filterDateOperator) {
								// date filter
								dialogFilterElements[i].getCustomControl().setDateValue(uniqueFilters[j].oValue1);
								dialogFilterElements[i].getCustomControl().setSecondDateValue(uniqueFilters[j].oValue2);
							} else {
								//label filter
								dialogFilterElements[i].getCustomControl().setValue(uniqueFilters[j].oValue1);
							}
							dialogFilterElements[i].setFilterCount(1);
							bool = true;
							break;
						}
					}
					if (!bool) {
						dialogFilterElements[i].getCustomControl().setValue("");
						dialogFilterElements[i].setFilterCount(0);
					}
				}
			}

			return dialogFilterElements;
		},

		revertFilterMap: function() {
			var i, uniqueFilters = this.getUniqueFilter();
			this.filterMap = {};
			for (i = 0; i < uniqueFilters.length; i++) {
				this.setFilterMap(uniqueFilters[i]);
			}

			return this.filterMap;
		},

		open: function() {
			this.getDialog().open();
		},

		onExit: function() {
			this.revertOnCancel();
		},

		onResetFilters: function() {
			var dialog = this.getDialog(),
				i;

			this.filterMap = {};

			for (i = 0; i < dialog.getFilterItems().length; i++) {
				dialog.getFilterItems()[i].getCustomControl().setValue("");
				dialog.getFilterItems()[i].setFilterCount(0);
			}
		},

		setFilterMap: function(tableFilter) {
			var key = tableFilter.sPath;
			this.filterMap[key] = {};

			if (tableFilter.sOperator === this.filterDateOperator) {
				this.filterMap[key].fromValue = tableFilter.oValue1;
				this.filterMap[key].toValue = tableFilter.oValue2;
				this.filterMap[key].isDateType = true;
			} else {
				this.filterMap[key].value = tableFilter.oValue1;
				this.filterMap[key].isDateType = false;
			}
		},
		getUniqueFilter: function() {
			var arr = [];
			if (this.tableFilters.length > 0) {
				if (this.tableFilters[0]._bMultiFilter) {
					for (var j = 0; this.tableFilters[0].aFilters.length > j; j++) {
						if (this.tableFilters[0].aFilters[j]._bMultiFilter) {
							arr.push(this.tableFilters[0].aFilters[j].aFilters[0]);
						} else {
							arr.push(this.tableFilters[0].aFilters[j]);
						}
					}
				} else {
					arr.push(this.tableFilters[0]);
				}
			}
			return arr;
		}

	});
}());