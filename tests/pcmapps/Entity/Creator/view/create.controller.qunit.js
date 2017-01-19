(function() {
    var eModules = [],
        firstViewModel,
        secondViewModel,
        model,
        entities = getEntityNames("creator");
    for(var i = 0; i < entities.length; i++){
        var m = "c4c.create-" + entities[i] + "Collection.remote.view.create";
        eModules.push(m);
        jQuery.sap.registerModulePath(m, registerPrefix + "/pcmapps/" +  entities[i] + "/" + entities[i] + "Creator/view/create.controller");
    }

    sap.ui.define(eModules.map(function(m){
        return m.replace(/[.]/g, '/');
    }), function() {

        module("pcmapps --> Creator create.controller", {
            setup: function() {
                window.generalNameSpace = {
                    pathToDestination: "sap/fiori/pcmcpapps/",
                    businessObject: {
                        oDataService: "c4c__public"
                    }
                };
                firstViewModel = new sap.ui.model.json.JSONModel();
                secondViewModel = new sap.ui.model.json.JSONModel();
                firstViewModel.getResourceBundle = function() {
                        return { getText: function(x,y) {
                                return "New Task"
                            }
                }};
                secondViewModel.getResourceBundle = function() {
                        return { getText: function(x) {
                            return "New Task"
                        }
                        }};
                firstViewModel.getResourceBundle = function() {
                        return { getText: function(x,y) {
                            return "New Task"
                        }
                        }};
                model = {
                        getModel: function(x) {
                            if(x === "i18n_static") {
                                return firstViewModel;
                            } else {
                                return secondViewModel;
                            }
                        },
                        byId: function() {
                            return btn;
                        }
                    };
            },

            teardown : function() {
                delete window.generalNameSpace;
            }
        });

        test("test service url", function(){
         var controller;
         for(var i = 0; i < eModules.length; i++){
         controller = sap.ui.controller(eModules[i]);
         strictEqual(controller.getServiceUrl("abc"), "/sap/fiori/pcmcpapps/abc");
         }
         });

        test("is Valid Form In Fragment", function(){
            var controller;
            var label1 =  $('<label id="_label1" data-sap-ui="_label1" style="text-align" class="sapMLabelRequired:visible"/>');
            var theParent = $('<div id="_vbox" class="sapMVBox"/>');
            var firstChild = $('<div class="sapMFlexItem"/>');
            firstChild.append(label1);

            var secondChild = $('<div class="sapMFlexItem"/>');
            var input = $('<input id="__xmlview0--AccountID_545-inner"/>');
            secondChild.append(input);

            theParent.append(firstChild);
            theParent.append(secondChild);

            var inputs = { byId: function(){
                return {getValue: function() { return "1234"}, getValueState: function() {return "Error"}, setValueState: function(){}};
            }};
            var sinonStub = sinon.stub(sap.ui, "getCore",function(){return inputs; });
            var fragment = { $: function () {
                return {
                    find: function (className) {
                        if(className === "sapMLabelRequired:visible") {
                            return label1;
                        } else {
                            return {};
                        }
                    }
                };
            }};
            for(var i = 0; i < eModules.length; i++){
                controller = sap.ui.controller(eModules[i]);
                strictEqual(controller.isValidFormInFragment(fragment), true);
            }
            sinonStub.restore();
        });
    });


    test("format Translation test", function(){
        var controller;
        for(var i = 0; i < eModules.length; i++){
            controller = sap.ui.controller(eModules[i]);
            sinon.stub(controller, "getView").returns(model);
            strictEqual(controller.formatTranslation("starterCreateTemplate.create.view.title,CHP.Task.UI.HeaderInfo.TypeName.Subject"), "New Task");
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
            controller = sap.ui.controller(eModules[i]);
            controller.handleRequiredInputChange(event);
            strictEqual(state, "Error");
            type = "";
            controller.handleRequiredInputChange(event);
            strictEqual(state, "None");
            type = "Number";
        }
    });
}());
