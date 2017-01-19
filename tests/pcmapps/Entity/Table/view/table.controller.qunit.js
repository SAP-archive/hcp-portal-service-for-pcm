(function(){
    jQuery.sap.require("sap.ui.core.format.DateFormat");
    var eModules = [],
        entities = getEntityNames("table");
    for(var i = 0; i < entities.length; i++){
        var m = "c4c.table-" + entities[i].toLowerCase() + "collection.remote.view.table";
        eModules.push(m);
        jQuery.sap.registerModulePath(m, registerPrefix + "/pcmapps/" + entities[i] + "/" + entities[i] + "Table/view/table.controller");
    }

    sap.ui.define(eModules.map(function(m){
        return m.replace(/[.]/g, '/');
    }), function() {

        module("pcmapps --> Table table.controller", {
            setup: function() {
                window.generalNameSpace = {
                    pathToDestination: "sap/fiori/pcmcpapps/",
                    businessObject: {
                        oDataService: "c4c__public"
                    },
                    appService: "abc"
                };
            },

            teardown : function() {
                delete window.generalNameSpace;
            }
        });

        test("test format Date", function(){
            var controller;
            for(var i = 0; i < eModules.length; i++){
                controller = sap.ui.controller(eModules[i]);
                strictEqual(controller.formatDate("/Date(1383724433459)/"), "Nov 6, 2013");
            }
        });

/*        test("test get Time From JsonTime", function(){
            var controller;
            for(var i = 0; i < eModulesTable.length; i++){
                controller = sap.ui.controller(eModulesTable[i]);
                strictEqual(controller.formatTimeDate("/Date(1383724433459)/"), "Nov 6, 2013, 9:53:53 AM", controller.formatTimeDate("/Date(1383724433459)/"));
            }
        });*/

        test("test get Time From JsonTime", function(){
            var controller;
            for(var i = 0; i < eModules.length; i++){
                controller = sap.ui.controller(eModules[i]);
                strictEqual(controller.getTimeFromJsonTime("/Date(1383724433459)/"), 1383724433459);
            }
        });

        test("test getS ervice Url", function(){
            var controller;
            for(var i = 0; i < eModules.length; i++){
                controller = sap.ui.controller(eModules[i]);
                sap.ushell = {services:{AppConfiguration:{}}};
                strictEqual(controller.getServiceUrl("abc"), "sap/fiori/pcmcpapps/abc");
            }
        });
    });
}());

