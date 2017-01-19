jQuery.sap.registerModulePath("c4c.registration.local.view.App", registerPrefix + "/pcmcpapps/PartnerRegistration/view/App.controller");

sap.ui.define(["c4c/registration/local/view/App"], function() {

    var controller,
        callback;

    module("pcmcpapps --> PartnerRegistration App.controller", {
        setup: function() {
            controller = sap.ui.controller("c4c.registration.local.view.App");
            window.generalNameSpace = {
                pathToDestination: "sap/fiori/pcmcpapps/",
                businessObject: {
                    oDataService: "c4c__public"
                }
            };
            controller.serviceUrl = controller.getServiceUrl(window.generalNameSpace.businessObject.oDataService);

            sinon.stub(jQuery, "ajax");
            callback = sinon.spy();
        },

        teardown : function() {
            delete window.generalNameSpace;
            jQuery.ajax.restore();
        }
    });

    test("test ajax requests url", function(){
        controller.getPartnerPrograms(callback);
        ok(jQuery.ajax.calledWithMatch({ url: "/sap/fiori/pcmcpapps/c4c__public/PartnerOnboardingRequestPartnerProgramCodeCollection?$format=json" }));

        controller.getPartnerTypes(callback);
        ok(jQuery.ajax.calledWithMatch({ url: "/sap/fiori/pcmcpapps/c4c__public/PartnerOnboardingRequestPartnerTypeCodeCollection?$format=json" }));

        controller.getCountries(callback);
        ok(jQuery.ajax.calledWithMatch({ url: "/sap/fiori/pcmcpapps/c4c__public/PartnerOnboardingRequestCountryCollection?$format=json" }));

        controller.getSalutation(callback);
        ok(jQuery.ajax.calledWithMatch({ url: "/sap/fiori/pcmcpapps/c4c__public/PartnerOnboardingRequestPartnerContactSalutationCollection?$format=json" }));

        controller.getLanguage(callback);
        ok(jQuery.ajax.calledWithMatch({ url: "/sap/fiori/pcmcpapps/c4c__public/PartnerOnboardingRequestPartnerContactPreferredLanguageCollection?$format=json" }));
    });

    test("test query value", function(){
        strictEqual(controller.getServiceUrl("abc"), "/sap/fiori/pcmcpapps/abc");
    });
});
