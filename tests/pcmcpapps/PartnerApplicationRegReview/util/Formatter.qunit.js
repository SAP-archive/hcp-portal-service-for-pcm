jQuery.sap.registerModulePath("appReview.local.util.Formatter", registerPrefix + "/pcmcpapps/PartnerApplicationRegReview/util/Formatter");

sap.ui.define(["appReview/local/util/Formatter"], function(Formatter) {

    var formatter;

    module("pcmcpapps --> PartnerApplicationRegReview Formatter", {
        setup: function() {
            formatter = Formatter;
        },

        teardown : function() {

        }
    });

    test("test status format", function(){
        ok(formatter.getStatusState("4") === "Success");
        ok(formatter.getStatusState(-1) === "Warning");
        ok(formatter.getStatusState() === "Warning");
    });
});
