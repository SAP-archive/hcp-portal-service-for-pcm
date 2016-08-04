(function () {
    "use strict";
    /*global jQuery, appReview*/
jQuery.sap.declare("appReview.local.util.Formatter");

appReview.local.util.Formatter = {
    getStatusState: function (fValue) {
            if (fValue === "4") {
                return "Success";
            } else {
                return "Warning";
            }
    }
};}());
