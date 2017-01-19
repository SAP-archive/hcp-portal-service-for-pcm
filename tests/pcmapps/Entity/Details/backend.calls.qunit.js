(function(){
    var eModules = [],
        eType = 'details',
        entities = getEntityNames(eType);
    for(var i = 0; i < entities.length; i++){
        var m = entities[i] + "." + eType + ".backend.calls";
        eModules.push(m);
        jQuery.sap.registerModulePath(m, registerPrefix + "/pcmapps/" +  entities[i] + "/" + entities[i] + "Details/backend.calls");
    }

    sap.ui.define([], function() {

        var server;

        module("pcmapps --> Details backend.calls", {
            setup: function() {
                window.generalNameSpace = {
                    pathToDestination: "sap/fiori/pcmcpapps/",
                    appService: ""
                };
            },

            teardown : function() {
                delete window.generalNameSpace;
                delete window.BackendCall;
                if (server.restore){
                    server.restore();
                }
                if (jQuery.ajax.restore){
                    jQuery.ajax.restore();
                }
            }
        });

        test("test service url and ajax calls", function(){
            for(var i = 0; i < eModules.length; i++){
                delete BackendCall;
                jQuery.sap.require(eModules[i]);
                strictEqual(BackendCall.getCsrfHeaderValue("GET"), "Fetch");
                window.csrfToken = "X" + i;
                strictEqual(BackendCall.getCsrfHeaderValue("POST"), "X" + i);
                strictEqual(BackendCall.getPrefixUrl(), window.generalNameSpace.pathToDestination);

                sinon.stub(jQuery, "ajax");
                BackendCall.doCall({
                    url: "something",
                    method: "GET",
                    data: "myData",
                    async: false,
                    contentType: "text"
                });

                ok(jQuery.ajax.calledWithMatch({
                    url: BackendCall.getPrefixUrl() + "something",
                    type: "GET",
                    data: "myData",
                    async: false,
                    contentType: "text"
                }));

                BackendCall.reExecuteWithNewToken({
                    url: "something",
                    async: false
                });

                ok(jQuery.ajax.calledWithMatch({
                    url: BackendCall.getPrefixUrl() + window.generalNameSpace.appService + "/$metadata",
                    headers: {
                        "x-csrf-token": "Fetch"
                    }
                }));

                jQuery.ajax.restore();

                server = sinon.fakeServer.create();

                var callback = sinon.spy();
                server.respondWith([200, { "Content-Type": "text/html", "Content-Length": 2 }, "OK"]);

                BackendCall.doCall({
                    url: "something",
                    method: "GET",
                    data: "myData",
                    successCallback: callback,
                    async: false,
                    contentType: "text"
                });
                ok(callback.calledOnce);
                server.restore();
            }
        });
    });
}());



