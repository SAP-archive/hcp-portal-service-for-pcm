jQuery.sap.registerModulePath("appReview.local.view.App", registerPrefix + "/pcmcpapps/PartnerApplicationRegReview/view/App.controller");

sap.ui.define(["appReview/local/view/App"], function() {

    var controller;

    module("pcmcpapps --> PartnerApplicationRegReview App.controller", {
        setup: function() {
            controller = sap.ui.controller("appReview.local.view.App");
            window.generalNameSpace = {
                pathToDestination: "sap/fiori/pcmcpapps/"
            }
        },

        teardown : function() {
            delete window.generalNameSpace;
        }
    });

    test("test App id", function(){
        strictEqual(controller.getAppID('01'),  '1');
        strictEqual(controller.getAppID('1'),  '1');
    });

    test("test query value", function(){
        strictEqual(controller.getServiceUrl("abc"), "/sap/fiori/pcmcpapps/abc");
    });

    test("test formatters", function(){
        strictEqual(controller.getAddressIndicator(true), "Yes");
        strictEqual(controller.getAddressIndicator(false), "No");
        strictEqual(controller.getAddressIndicator("true"), "No");
        strictEqual(controller.getAddressIndicator(), "No");

        ok(controller.selectCheckbox(true));
        notOk(controller.selectCheckbox(false));
        notOk(controller.selectCheckbox("true"));
        notOk(controller.selectCheckbox());
    });
});
