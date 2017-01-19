jQuery.sap.registerModulePath("sap.ui.fiori.util.Formatter", registerPrefix + "/pcmcpapps/Invite/util/Formatter");

sap.ui.define(["sap/ui/fiori/util/Formatter"], function(Formatter) {

    var formatter;

    module("pcmcpapps --> Invite Formatter", {
        setup: function() {
            formatter = Formatter;
        },

        teardown : function() {

        }
    });

    test("test status format", function(){
        ok(formatter.status(formatter.statusStateValues.SUCCESS) === "Success");
        ok(formatter.status(formatter.statusStateValues.FAILURE) === "Error");
        ok(formatter.status(formatter.statusStateValues.IN_PROCESS) === "None");
        ok(formatter.status("-1") === "None");
        ok(formatter.status() === "None");

        ok(formatter.statusIcon(formatter.statusStateValues.SUCCESS) === "accept");
        ok(formatter.statusIcon(formatter.statusStateValues.FAILURE) === "notification");
        ok(formatter.statusIcon(formatter.statusStateValues.IN_PROCESS) === "pending");
    });
});
