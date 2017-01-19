(function(){
    var eModules = [],
        entities = getEntityNames("table");
    for(var i = 0; i < entities.length; i++){
        var m = "c4c.table-" + entities[i].toLowerCase() + "collection.remote.view.dialog";
        eModules.push(m);
        jQuery.sap.registerModulePath(m, registerPrefix + "/pcmapps/" + entities[i] + "/" + entities[i] + "Table/view/dialog.controller");
    }

    sap.ui.define(eModules.map(function(m){
        return m.replace(/[.]/g, '/');
    }), function() {

        module("pcmapps --> Table dialog.controller", {
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

        test("test getS ervice Url", function(){
            var controller;
            for(var i = 0; i < eModules.length; i++){
                controller = sap.ui.controller(eModules[i]);
                controller.tableFilters = [
                        {
                            _bMultiFilter: true,
                            aFilters: [
                                {
                                    _bMultiFilter: true,
                                    aFilters: [
                                        {
                                            val: "a"
                                        },
                                        {
                                            val: "c"
                                        }
                                    ]
                                },
                                {
                                    val: "b"
                                }
                            ]
                        }
                ];
                var arr = controller.getUniqueFilter();
                ok(2, arr.length);
                strictEqual(arr[0].val, "a");
                strictEqual(arr[1].val, "b");
            }
        });

        test("test resetTableFilters", function(){
            var controller;
            for(var i = 0; i < eModules.length; i++){
                controller = sap.ui.controller(eModules[i]);
                var setDateValueSpy = sinon.spy(),
                    setSecondDateValueSpy = sinon.spy(),
                    setValueSpy = sinon.spy();

                var customControl1 = function(){
                    return {
                        setDateValue:setDateValueSpy,
                        setSecondDateValue: setSecondDateValueSpy,
                        setValue: setValueSpy,
                        mProperties: {
                            valueFormat: true
                        }
                    };
                };

                var customControl2 = function(){
                    return {
                        setDateValue:setDateValueSpy,
                        setSecondDateValue: setSecondDateValueSpy,
                        setValue: setValueSpy,
                        mProperties: {
                            valueFormat: false
                        }
                    };
                };
                var dialog = sinon.stub(controller, "getDialog", function(){
                    return {
                        getFilterItems: function(){
                            return [{
                                getCustomControl: customControl1,
                                setFilterCount: function(){}
                            },
                                {
                                    getCustomControl: customControl2,
                                    setFilterCount: function(){}
                                }];
                        }
                    };
                });
                controller.resetTableFilters();
                ok(setDateValueSpy.calledOnce);
                ok(setSecondDateValueSpy.calledOnce);
                ok(setValueSpy.calledOnce);

            }
        });
    });


}());

