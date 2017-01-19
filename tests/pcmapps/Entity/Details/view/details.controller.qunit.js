(function(){
    var eModules = [],
        requireModules = [],
        eType = 'details',
        entities = getEntityNames("details");
    for(var i = 0; i < entities.length; i++){
        var m1 = "c4c.details-" + entities[i].toLowerCase() + "collection.local.view.details";
        var m2 = entities[i] + "." + eType + "v2.backend.calls";

        eModules.push({
            entityName: entities[i],
            controller: m1,
            backend: m2
        });

        requireModules.push(m1);

        jQuery.sap.registerModulePath(m1, registerPrefix + "/pcmapps/" +  entities[i] + "/" + entities[i] + "Details/view/details.controller");
        jQuery.sap.registerModulePath(m2, registerPrefix + "/pcmapps/" +  entities[i] + "/" + entities[i] + "Details/backend.calls");
    }

    function loadResource(resource){
        jQuery.ajax.restore();
        jQuery.sap.require(resource);
        sinon.stub(jQuery, "ajax");
    }

    sap.ui.define(requireModules.map(function(m){
        return m.replace(/[.]/g, '/');
    }), function() {

        module("pcmapps --> Details details.controller", {
            setup: function() {
                window.generalNameSpace = {
                    pathToDestination: "sap/fiori/pcmcpapps/",
                    appServiceSuffix: "/sap/c4c/odata/v1/pcmportal",
                    businessObject: {
                        oDataService: "c4c__public"
                    }
                };
                sinon.stub(jQuery, "ajax");
            },

            teardown : function() {
                jQuery.ajax.restore();
                delete window.generalNameSpace;
            }
        });

        test("test get title", function(){
            var controller;
            for(var i = 0; i < eModules.length; i++){
                controller = sap.ui.controller(eModules[i].controller);
                strictEqual(controller.getTitle("title1", "title2"), "title1(title2)");
            }
        });

        test("test get Field Details", function(){
            var controller;
            for(var i = 0; i < eModules.length; i++){
                controller = sap.ui.controller(eModules[i].controller);
                strictEqual(controller.getFieldDetails("title1", "title2"), "title1 title2");
            }
        });
        test("test get Service url", function(){
            var controller;

            for(var i = 0; i < eModules.length; i++){
                controller = sap.ui.controller(eModules[i].controller);
                sap.ushell = {services:{AppConfiguration:{}}};
                strictEqual(controller.getServiceUrl("abc"), "sap/fiori/pcmcpapps/abc");
            }
        });

        test("test handleRequiredInputChange", function(){
            var src = {
                    getType: function(){
                        return type;
                    },
                    getValue: function(){
                        return "";
                    },
                    setValueState: function(s){
                        state = s;
                    }
                },
                event = {
                    getSource: function(){
                        return src;
                    }
                },
                type = "Number",
                state,
                controller;
            for(var i = 0; i < eModules.length; i++){
                controller = sap.ui.controller(eModules[i].controller);
                controller.handleRequiredInputChange(event);
                strictEqual(state, "Error");
                type = "";
                controller.handleRequiredInputChange(event);
                strictEqual(state, "None");
                type = "Number";
            }
        });

        test("test getFirstRowID", function(){
            var controller;
            for(var i = 0; i < eModules.length; i++){
                controller = sap.ui.controller(eModules[i].controller);
                window.generalNameSpace.businessObject.targetEntity = eModules[i].entityName + "Collection";
                delete BackendCall;
                loadResource(eModules[i].backend);
                controller.getFirstRowID();
                ok(jQuery.ajax.calledWithMatch({ url: [
                        window.generalNameSpace.pathToDestination,
                        window.generalNameSpace.businessObject.oDataService,
                        "/",
                        window.generalNameSpace.businessObject.targetEntity,
                        "?$skip=0&$top=1"
                    ].join('')
                 }));
             }
        });

        test("test resetFormForDialog", function(){
            var controller;
            for(var i = 0; i < eModules.length; i++){
                controller = sap.ui.controller(eModules[i].controller);
                var data = {
                    a: 1,
                    b: ""
                };
                controller.resetFormForDialog(data);
                ok(data.a === null);
                ok(data.b === null);
            }
        })
    });
}());

