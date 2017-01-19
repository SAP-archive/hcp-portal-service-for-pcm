(function() {
    var eModules = [],
        entities = getEntityNames("creator");
    for(var i = 0; i < entities.length; i++){
        var m = "c4c.details-" + entities[i].toLowerCase() + "collection.local.view.vhelpdialog";
        eModules.push(m);
        jQuery.sap.registerModulePath(m, registerPrefix + "/pcmapps/" +  entities[i] + "/" + entities[i] + "Details/view/vhelpdialog.controller");
    }

    sap.ui.define(eModules.map(function(m){
        return m.replace(/[.]/g, '/');
    }), function() {

        module("pcmapps --> Details vhelpdialog.controller", {
            setup: function() {
                window.generalNameSpace = {
                    pathToDestination: "sap/fiori/pcmcpapps/",
                    businessObject: {
                        oDataService: "c4c__public"
                    }
                };
            },

            teardown : function() {
                delete window.generalNameSpace;
            }
        });

        test("get Translated Title", function(){
            var controller;
            for(var i = 0; i < eModules.length; i++){
                controller = sap.ui.controller(eModules[i]);
                controller.translationAnnotationModel = { getResourceBundle: function() {
                    return {getText: function(){ return "Translated Text"}}
                }};
                strictEqual(controller.getTranslatedTitle("title", "key"), "Translated Text");
            }
        });
        test("get Service Url", function(){
            var controller;
            for(var i = 0; i < eModules.length; i++){
                controller = sap.ui.controller(eModules[i]);
                strictEqual(controller.getServiceUrl("abc"), "sap/fiori/pcmcpapps/abc");
            }
        });

        test("convert Params test", function(){
            var controller, sinonStub;
            var params = {CollectionPath: "Account", BusinessObject:"OpportunityCollection", searchSupported: false, viewParams: {AccountId: ["AccountId"]}, fieldName: "AccountId",
                searchValue: "",filterable: [],titleKey: "CHP.Opportunity.UI.Identification.UI.DataField.AccountID", prefixKey: "CHP.Opportunity.AccountID.Common.ValueList"};
            for(var i = 0; i < eModules.length; i++){
                controller = sap.ui.controller(eModules[i]);
                sinonStub = sinon.stub(controller, "getTranslatedTitle",function(){return "Account"; });
                sap.ushell = {services:{AppConfiguration:{}}};

                var response = controller.convertParams(params);
                strictEqual(response.searchField, "AccountId");
            }
            sinonStub.restore();
        });

        test("get Selected Row Object test", function(){
            var controller, sinonStub, table, cells;
            var columns = [{name: "Account Id", path: "AccountId",localsIds:["AccountId"]}];
            var firstCell = {getText: function(){return "newText"}};
            var data = {columns: columns};
            table = {
                getSelectedItem: function() {
                    return {getCells: function() {
                     return [firstCell];
                    }}
                }
            };
            for(var i = 0; i < eModules.length; i++){
                controller = sap.ui.controller(eModules[i]);
                controller.oDialog = { getModel:function(){return {getData: function(){return data;}}}};
                sap.ushell = {services:{AppConfiguration:{}}};
                var response = controller.getSelectedRowObject(table);
                strictEqual(response["Account Id"]["value"], "newText");
            }

        });
    });

}());
