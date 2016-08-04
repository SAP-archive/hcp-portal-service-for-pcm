(function () {
    "use strict";
    /*global  jQuery, sap*/
    jQuery.sap.declare("sap.ui.fiori.util.Formatter");

sap.ui.fiori.util.Formatter = {

    statusStateMap: {
        "SUCCESS": "invitees.status.accept",
        "IN_PROCESS": "invitees.status.pending",
        "FAILURE": "invitees.status.fail"
    },
    statusStateValues: {
        "SUCCESS": "SUCCESS",
        "IN_PROCESS": "IN_PROCESS",
        "FAILURE": "FAILURE"
    },
    status: function (fValue) {

        try {
            var map = sap.ui.fiori.util.Formatter.statusStateValues;
            if (fValue === map.FAILURE) {
                return "Error";
            } else if (fValue === map.SUCCESS) {
                return "Success";
            } else {
                return "None";
            }
        } catch (err) {
            return "None";
        }
    },
    statusText: function (value) {

        var map = sap.ui.fiori.util.Formatter.statusStateMap;
        var bundle = this.getModel("i18n").getResourceBundle();

         if (value && map[value]) {
             return bundle.getText(map[value]);
         } else {
             return "";
         }
    },
    statusIcon: function (fValue) {
        try {
            var map = sap.ui.fiori.util.Formatter.statusStateValues;
            if (fValue === map.FAILURE) {
                return "notification";
            } else if (fValue === map.SUCCESS) {
                return "accept";
            } else if (fValue === map.IN_PROCESS) {
                return "pending";
            }
        } catch (err) {
            return "None";
        }
    },


    inviteeName: function (fName, lName) {
        try {

            if (!fName && !lName) {
                this.addStyleClass("no-name");
                var bundle = this.getModel("i18n").getResourceBundle();
                return bundle.getText("invitees.invitee.name.before.acceptance", "?");
            }
            return (fName ? (fName + " ") : " ") + (lName ? (lName + " ") : "");
        } catch (err) {
            return "";
        }
    }
};}());
