jQuery.sap.registerModulePath("registrationview.local.view.RegistrationView", registerPrefix + "/pcmcpapps/RegistrationWidget/view/RegistrationView.controller");

sap.ui.define(["registrationview/local/view/RegistrationView"], function(RegistrationView) {

    var registrationView,viewModel, model, btn;

    module("pcmcpapps --> RegistrationWidget RegistrationWidget", {
        setup: function() {
            registrationView = new sap.ui.controller("registrationview.local.view.RegistrationView");
            viewModel = new sap.ui.model.json.JSONModel();
            viewModel.getData = function() {
                return {
                    show_button_icon: {value: {"xxx": ""}}
                }
            },
                model = {
                    getModel: function() {
                        return viewModel
                    },
                    byId: function() {
                        return btn;
                    }
                };


        },

        teardown : function() {

        }
    });

    test("getDialogFragment", function(){
        btn = new sap.ui.commons.Button();
        sinon.stub(registrationView, "getView").returns(model);
        var spy = sinon.spy(btn, "setIcon");
        registrationView.updateIcon();
        ok(spy.calledOnce, "call oComponent.updateUshellConfig");
    });

    test("register", function(){
        registrationView.isValidate = function () {
            return true;
        };
        viewModel.getData = function() {
            return {
                postData: {candidateFirstName: "FirstName", candidateLastName: "LastName", mail:"FirstLast@bla.com"},
                callback : {displayMessage: false , msg: "", status:"", showFields: true, postData: {candidateFirstName:"", candidateLastName:"", mail:""}, displayBusyIndicator: true}
            }
        };
        registrationView.oComp = {
            getSiteId: function() {
                return "1234";
            },
            oBundle : { getText: function() {
                return "success"
            }}
        };

        jQuery.ajax({
            url: "/fiori/public/v1/services/invitations/publicidpregister/" + "1234" + "?platform=C4C&fname=" + "FirstName" + "&lname=" + "LastName" + "&email=" + "FirstLast@bla.com",
            responseText:
            {
                callback: {msg: "sa"}
            }
        });
        sinon.stub(registrationView, "getView").returns(model);
        sinon.stub(jQuery, "ajax").yieldsTo("success");
        registrationView.register();
        ok(jQuery.ajax.calledWithMatch({ url: "/fiori/public/v1/services/invitations/publicidpregister/" + "1234" + "?platform=C4C&fname=" + "FirstName" + "&lname=" + "LastName" + "&email=" + "FirstLast@bla.com" }));
        jQuery.ajax.restore();

        sinon.stub(jQuery, "ajax").yieldsTo("error", {status: 500, responseJSON: {error: {msg:""}}});
        registrationView.register();
        ok(jQuery.ajax.calledWithMatch({ url: "/fiori/public/v1/services/invitations/publicidpregister/" + "1234" + "?platform=C4C&fname=" + "FirstName" + "&lname=" + "LastName" + "&email=" + "FirstLast@bla.com" }));
        jQuery.ajax.restore();
    });

    test("isValidateTrue", function(){
        var inputs = { byId: function(){
            return {getValue: function() { return "value"}, getValueState: function() {return "state"}};
        }};
        var s = sinon.stub(sap.ui, "getCore",function(){return inputs; });
        ok(registrationView.isValidate());
        s.restore();
    });

    test("isValidateFalse", function(){
        var inputs = { byId: function(){
            return {getValue: function() { return "value"}, getValueState: function() {return "Error"}};
        }};
        var s = sinon.stub(sap.ui, "getCore",function(){return inputs; });
        equal(registrationView.isValidate(),false);
        s.restore();
    });

    test("enableSaveByInput", function(){
        ok(registrationView.enableSaveByInput("notEmpty"));
    });
});
