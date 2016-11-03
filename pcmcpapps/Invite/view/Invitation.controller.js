(function(){
    "use strict";
    /*global  jQuery, sap, window*/
    jQuery.sap.require("c4c.manage-invitations.local.util.Formatter");
    jQuery.sap.require("c4c.manage-invitations.local.util.Services");
    jQuery.sap.require("sap.m.MessageBox");

    sap.ui.controller("c4c.manage-invitations.local.view.Invitation", {
        oDialog: null,
        busyDialog: null,
        service: null,
        table: null,

        RESPONSE_STATUS: {
            SUCCESS: "",
            ALREADY_EXIST: "an_invitation_already_exists",
            ERROR: "general_error"

        },

        getSiteId: function(){
            if (this.siteId){
                return this.siteId;
            } else {
                var siteService = sap.ushell.Container.getService("SiteService");
                this.siteId = siteService.getSiteID();
            }
            return this.siteId;
        },

        onInit: function () {
            var view = this.getView(),
                tableRendered = new jQuery.Deferred(),
                invitationsLoaded = new jQuery.Deferred();
            if (!this.table){
                this.table = sap.ui.getCore().byId('Invitation--idInviteesTable');
                this.table.onAfterRendering = function(){
                    tableRendered.resolve();
                };
            }
            jQuery.when(invitationsLoaded, tableRendered).done(function(oModel){
                this.table.setModel(oModel);
            }.bind(this));
            this.service = new sap.ui.fiori.util.Services(this.getSiteId());

            this.service.loadResourceBundle(this.getOwnerComponent().getModel("i18n"));

            this.service.load(function(invitations){
                var data = {invitationFlows: invitations};
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData(data);
                invitationsLoaded.resolve(oModel);
            });

            var formModel = new sap.ui.model.json.JSONModel();
            formModel.setData({
                email: "",
                firstName: "",
                lastName: "",
                message: "",
                department: "",
                functionVal: ""
            });

            formModel.setProperty("/PartnerData",{
                extendedInvitation: false
            });

            this.populateComboboxes(formModel);
            this.oForm = sap.ui.xmlfragment("invitationForm", "c4c.manage-invitations.local.view.invitationForm", this);
            this.oForm.setModel(formModel);
            view.byId("invitation-page").insertContent(this.oForm, 0);
            var responseMessage = sap.ui.core.Fragment.byId("invitationForm", "response-message");
            responseMessage.setVisible(false);
            this.attachValidationEvents();
        },

        populateComboboxes: function(model){
            jQuery.ajax({
                url: "/sap/fiori/pcmapps/c4c/sap/c4c/odata/v1/pcmportal/PartnerContactDepartmentCollection?$format=json",
                success: function(data){
                    model.setProperty("/PartnerData",{
                        extendedInvitation: true
                    });
                    model.setProperty("/departments", data.d.results);
                }
            });

            jQuery.ajax({
                url: "/sap/fiori/pcmapps/c4c/sap/c4c/odata/v1/pcmportal/PartnerContactFunctionCollection?$format=json",
                success: function(data){
                    model.setProperty("/PartnerData",{
                        extendedInvitation: true
                    });
                    model.setProperty("/functions", data.d.results);
                }
            });
        },

        deleteInvitee: function (evt) {
            var path = evt.getParameter("listItem").getBindingContext().getPath();
            var idx = parseInt(path.substring(path.lastIndexOf("/") + 1),10);
            var m = this.table.getModel();
            var d = m.getData();
            var itemData = d.invitationFlows[idx];
            if (itemData.status === "SUCCESS"){
                sap.m.MessageBox.alert(this.service.getResourceBundle().getText("invitees.table.remove.accepted.user.message"),null, this.service.getResourceBundle().getText("invitees.table.remove.accepted.user.title"));
                return;
            }
            this.service.uninvite(itemData.inviteeEmail, function () {
                d.invitationFlows.splice(idx, 1);
                m.setData(d);
                m.refresh();
            });


        },

        attachValidationEvents: function () {
            // attach handlers for validation errors
            sap.ui.getCore().attachValidationError(function (evt) {
                var control = evt.getParameter("element");
                if (control && control.setValueState) {
                    control.setValueState("Error");
                }
            });
            sap.ui.getCore().attachValidationSuccess(function (evt) {
                var control = evt.getParameter("element");
                if (control && control.setValueState) {
                    control.setValueState("None");
                }
            });
        },

        sendInvitation: function () {
            // collect input controls
            var inputs = [
                sap.ui.core.Fragment.byId("invitationForm", "email"),
                sap.ui.core.Fragment.byId("invitationForm", "firstName"),
                sap.ui.core.Fragment.byId("invitationForm", "lastName")
            ];


            jQuery.each(inputs, function (i, input) {
                if (!input.getValue()) {
                    input.setValueState("Error");
                } else {
                    input.setValueState("None");
                }
            });

            var canContinue = true;
            jQuery.each(inputs, function (i, input) {
                var state = input.getValueState();
                if (state === "Error") {
                    canContinue = false;
                    return false;
                }
            });


            if (!canContinue) {

                return false;
            }
            var oData = this.oForm.getModel().getData();

            oData.department = sap.ui.core.Fragment.byId("invitationForm", "department").getSelectedKey();
            oData.functionVal = sap.ui.core.Fragment.byId("invitationForm", "function").getSelectedKey();

            var that = this;

            this.service.invite(oData, function (invitationFlow) {
                if (invitationFlow.status === "FAILURE"){
                    invitationFlow.messageStatus = that.RESPONSE_STATUS.ERROR;
                }
                that.displayResponseMessage(invitationFlow.messageStatus);
                if (invitationFlow.messageStatus === that.RESPONSE_STATUS.ALREADY_EXIST) {
                    return;
                }
                that.oForm.getModel().setData({
                    email: "",
                    firstName: "",
                    lastName: "",
                    message: "",
                    department: "",
                    functionVal: ""
                });
                var oModel = that.table.getModel();

                oModel.getData().invitationFlows.push(invitationFlow);
                oModel.refresh();
            });
        },

        /**
         * This is a custom model type for validating email
         */
        typeEMail: sap.ui.model.SimpleType.extend("email", {
            formatValue: function (oValue) {
                return oValue;
            },
            parseValue: function (oValue) {
                //parsing step takes place before validating step, value can be altered
                return oValue;
            },
            validateValue: function (oValue) {
                var mailregex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

                if (!oValue.match(mailregex)) {
                    throw new sap.ui.model.ValidateException("is not a valid email address");
                }
            }
        }),
        handleViewSettingsDialogButtonPressed: function () {
            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment("c4c.manage-invitations.local.view.Dialog",this);
                this.getView().addDependent(this.oDialog);
            }
            // toggle compact style
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oDialog);
            this.oDialog.open();
        },
        handleConfirm: function (oEvent) {

            var oView = this.getView();
            var oTable = oView.byId("idInviteesTable");


            var mParams = oEvent.getParameters();
            var oBinding = oTable.getBinding("items");

            // (grouping comes before sorting)
            var aSorters = [];

            var sPath = mParams.sortItem.getKey();
            var bDescending = mParams.sortDescending;
            aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
            oBinding.sort(aSorters);

        },

        handleNavButtonPress: function(){
            window.history.back();
        },

        onEditMode: function (evt) {
            var oView = this.getView();
            var oTable = oView.byId("idInviteesTable");
            if (evt.getSource().getPressed()) {
                oTable.setMode("Delete");
            } else {
                oTable.setMode("None");
            }
        },

        displayResponseMessage: function (status) {
            var responseMessage = sap.ui.core.Fragment.byId("invitationForm", "response-message");
            var responseMessageText = sap.ui.core.Fragment.byId("invitationForm", "response-message-text");
            var responseMessageIcon = sap.ui.core.Fragment.byId("invitationForm", "response-message-icon");
            responseMessage.setVisible(true);

            switch (status) {
                case this.RESPONSE_STATUS.ALREADY_EXIST:
                    responseMessageIcon.setState("None");
                    responseMessageIcon.setIcon("sap-icon://employee-approvals");
                    responseMessageText.setText(this.service.getResourceBundle().getText("invitees.send.warning.message"));
                    break;

                case this.RESPONSE_STATUS.ERROR:

                    responseMessageIcon.setIcon("sap-icon://notification");
                    responseMessageText.setText(this.service.getResourceBundle().getText("invitees.send.fail.message"));
                    break;

                default :

                    responseMessageIcon.setState("Success");
                    responseMessageIcon.setIcon("sap-icon://accept");
                    responseMessageText.setText(this.service.getResourceBundle().getText("invitees.send.success.message"));
                    break;
            }

        }
    });}());
