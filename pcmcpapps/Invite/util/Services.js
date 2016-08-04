(function () {
    "use strict";
    /*global  jQuery, window, sap*/
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.declare("sap.ui.fiori.util.Services");

sap.ui.fiori.util.Services = function (siteId) {

    var bundle = null;
    var busyDialog = new sap.m.BusyDialog();

    var URL = "/fiori/v1/services/invitations/{service}/" + siteId + "{param}?platform=C4C";

    this.loadResourceBundle = function (i18n) {
        bundle = i18n.getResourceBundle();
    };

    this.getResourceBundle = function () {
        return bundle;
    };


    this.load = function (success) {


        var url = this.stringFormat(URL, {service: "invite", param: ""});
        var getRB = this.getResourceBundle;
        jQuery.ajax({
            url: url,
            dataType: "json",
            contentType: "application/json",
            success: function (oData) {
                if (oData.status === "OK") {
                    var invitationsFlow = [];
                    if (oData.invitationFlows) {
                        invitationsFlow = jQuery.isArray(oData.invitationFlows) ? oData.invitationFlows : [oData.invitationFlows];
                    }
                    success(invitationsFlow);
                } else {
                    sap.m.MessageToast.show(getRB().getText("invitees.loading.fail.message"));
                }
            }, error: function (res) {
                sap.m.MessageBox.show(
                    (res.responseJSON ? res.responseJSON.error.msg : res.statusText), {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: res.statusText,
                        actions: [sap.m.MessageBox.Action.OK]
                    }
                );
            }
        });

    };

    this.invite = function (data, success) {
        var getRB = this.getResourceBundle;
        busyDialog.setTitle(getRB().getText("invitees.send.message.title.msg.wait"));
        busyDialog.setText(getRB().getText("invitees.send.message"));
        busyDialog.open();
        var url = this.stringFormat(URL, {service: "invite", param: ""});
        var invitations = [];
        var invitation = {"mail": data.email, "firstName": data.firstName, "lastName": data.lastName, "department": data.department, "function": data.functionVal};
        invitations.push(invitation);

        jQuery.ajax({
            url: url,
            headers: { "X-CSRF-Token": window.csrfToken},
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({
                message: data.message,
                recipientText: "",
                customData: {properties: []},
                invitations: invitations
            }),
            success: function (oData) {
                if (oData.status === "OK") {
                    if (oData.invitationFlows) {
                        var invitationsFlow = oData.invitationFlows[0];
                        busyDialog.close();
                        success(invitationsFlow);
                    }

                } else {
                    sap.m.MessageToast.show(getRB().getText("invitees.send.fail.message"));
                }
            }, error: function (res) {
                busyDialog.close();
                sap.m.MessageBox.show(
                    (res.responseJSON ? res.responseJSON.error.msg : res.statusText), {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: res.statusText,
                        actions: [sap.m.MessageBox.Action.OK]
                    }
                );


            }
        });


    };

    this.uninvite = function (mail, success) {
        var getRB = this.getResourceBundle;
        busyDialog.setTitle(getRB().getText("invitees.send.message.title.msg.wait"));
        busyDialog.setText(getRB().getText("invitees.table.remove.user.msg")/* +mail*/);
        var url = this.stringFormat(URL, {service: "uninvite", param: "/" + mail});

        var msgAlert = getRB().getText("invitees.table.remove.user.alert") + " " + mail,
            titleMsg = getRB().getText("invitees.table.remove.user.title.msg");

        function fnCallbackConfirm(oAction) {
            if (oAction === sap.m.MessageBox.Action.OK) {
                busyDialog.open();
                jQuery.ajax({
                    url: url,
                    type: "DELETE",
                    headers: { "X-CSRF-Token": window.csrfToken},
                    dataType: "json",
                    contentType: "application/json",
                    success: function (res) {
                        busyDialog.close();
                        if (res.status === "SUCCESS") {
                            success();
                        } else {
                            sap.m.MessageToast.show(getRB().getText("invitees.table.remove.user.failed"));
                        }
                    }, error: function (res) {
                        busyDialog.close();
                        sap.m.MessageBox.show(
                            (res.responseJSON ? res.responseJSON.error.msg : res.statusText), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: res.statusText,
                                actions: [sap.m.MessageBox.Action.OK]
                            }
                        );

                    }
                });
            }
        }

        function openConfirm() {
            // open a simple confirm box
            sap.m.MessageBox.show(msgAlert, {
                onClose: fnCallbackConfirm,
                title: titleMsg,
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL]
            });
        }

        openConfirm();
    };


    this.stringFormat = function (str, obj) {
        var formatted = str;
        jQuery.each(obj, function (k) {
            var regexp = new RegExp("\\{" + k + "\\}", "gi");
            formatted = formatted.replace(regexp, obj[k]);
        });
        return formatted;
    };
};}());
