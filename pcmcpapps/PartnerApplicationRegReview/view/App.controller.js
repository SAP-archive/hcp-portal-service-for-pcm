(function () {
    "use strict";
    /*global jQuery, sap, window, parent*/
    jQuery.sap.require("appReview.local.util.Formatter");
    sap.ui.controller("appReview.local.view.App", {

        data: {},
        onInit: function () {

            var that = this;
            var oJsonModel = new sap.ui.model.json.JSONModel(),
                businessObject = window.generalNameSpace.businessObject,
                src = this.getServiceUrl(businessObject.oDataService),
                partnerContactEmail = window["sap-hana-uis-fiori-model"].user.userEmail,
                filter = "PartnerContactEmail eq '" + partnerContactEmail + "' and RequestStatusCode ne '5'",
                queryApi = src + "/" + businessObject.targetEntity + "?$format=json&$filter=" + encodeURI(filter);

            var view = this.getView();
            view.setBusy(true);
            jQuery.ajax({
                url: queryApi,
                success: function (response) {
                    that.data = {};
                    var responseJSON = response.d.results[0];
                    for (var key in responseJSON) {
                        that.data[key] = responseJSON[key];
                    }

                    sap.ui.getCore().AppContext = {};
                    var industryAPI = src + "/" + businessObject.targetEntity + "('" + that.data.ObjectID + "')/PartnerOnboardingIndustry?$format=json";
                    jQuery.ajax({
                        url: industryAPI,
                        success: function (eResponse) {
                            view.setBusy(false);
                            var dataTable = [];
                            jQuery.each(eResponse.d.results,function(idx, industry) {
                                var propObject = {};
                                propObject.IndustrialSectorCodeText = industry.IndustrialSectorCodeText;
                                propObject.DefaultIndicator = industry.DefaultIndicator;
                                dataTable.push(propObject);
                            });
                            var oJsonTableModel = new sap.ui.model.json.JSONModel();
                            oJsonTableModel.setData({rows: dataTable});
                            view.setModel(oJsonTableModel,"IndustryTableModel");
                            sap.ui.getCore().AppContext.Industries = oJsonTableModel;
                        },
                        error: function(err){
                            view.setBusy(false);
                            jQuery.sap.require("sap.m.MessageToast");
                            sap.m.MessageToast.show(err.statusText);
                        }
                    });
                    var textAPI = src + "/" + businessObject.targetEntity + "('" + that.data.ObjectID + "')/PartnerOnboardingText?$format=json";
                    jQuery.ajax({
                        url: textAPI,
                        success: function (eResponse) {
                            view.setBusy(false);
                            var responsedJSON = eResponse.d.results[0];
                            for (var res in responsedJSON) {
                                that.data[res] = responsedJSON[res];
                            }
                            view.setModel(oJsonModel);
                            oJsonModel.setData(that.data);
                        },
                        error: function(err){
                            view.setModel(oJsonModel);
                            oJsonModel.setData(that.data);
                            view.setBusy(false);
                            jQuery.sap.require("sap.m.MessageToast");
                            sap.m.MessageToast.show(err.statusText);
                        }
                    });
                    var contactAddressSameAsPartner = that.data.AddressIndicator;
                    if (contactAddressSameAsPartner !== false) {
                        view.byId("contactPostalCode").setVisible(false);
                        view.byId("PartnerContactAddress").setVisible(false);
                        view.byId("PartnerContactCountry").setVisible(false);
                        view.byId("PartnerContactCity").setVisible(false);
                    }
                }, error: function(err){
                    view.setBusy(false);
                    jQuery.sap.require("sap.m.MessageToast");
                    sap.m.MessageToast.show(err.statusText);
                }
            });
            this.loadBundle();
        },
        loadBundle: function(){
            //Load resource Bundle
            var i18nModel = this.getOwnerComponent().getModel("i18n");
            this.getView().setModel(i18nModel, "i18n");
        },

        handleNavButtonPress: function(){
            window.history.back();
        },

        /** getServiceUrl - returns query value
         * @memberOf view.c4ctable
         * @returns portalQuery/defaultQuery
         */
        getServiceUrl: function (query) {
            return ["/", window.generalNameSpace.pathToDestination, query].join('');
        },


        getAddressIndicator: function(value){
            if (value === true) {
                return "Yes";
            } else {
                return "No";
            }
        },

        getAppID: function(value){
            var str;
            if (value) {
                str = value.replace(/^0+/, "");
            } else {
                str = "";
            }
            return str;
        },

        selectCheckbox: function(value) {
            if (value === true) {
                return true;
            } else {
                return false;
            }
        }

    });}());
