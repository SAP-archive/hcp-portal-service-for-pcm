jQuery.sap.registerModulePath("sap.ui.fiori.util.Services", registerPrefix + "/pcmcpapps/Invite/util/Services");

sap.ui.define(["sap/ui/fiori/util/Services"], function(Services) {

    var services,
        URL;

    module("pcmcpapps --> Invite Services", {
        setup: function() {
            services = new Services('123');
            URL = "/fiori/v1/services/invitations/{service}/" + 123 + "{param}?platform=C4C";
        },

        teardown : function() {

    }
    });

    test("test url foramt", function(){
        ok(services.stringFormat(URL, {service: 'a', param: '/b'}) ===  '/fiori/v1/services/invitations/a/123/b?platform=C4C');
        ok(services.stringFormat(URL, {service: 'a', param: ''}) ===  '/fiori/v1/services/invitations/a/123?platform=C4C');
    });
});