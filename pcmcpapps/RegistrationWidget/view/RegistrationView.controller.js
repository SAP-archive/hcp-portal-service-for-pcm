(function () {
    "use strict";
    /*global sap , jQuery*/
    sap.ui.define(["jquery.sap.resources", "sap/ui/model/SimpleType", "sap/ui/model/ValidateException"], function() {
        return sap.ui.controller("registrationview.local.view.RegistrationView", {

            getDialogFragment: function getDialogFragment() {
                if (!this.oDialogFragment) {
                    this.oDialogFragment = sap.ui.xmlfragment("registrationview.local.view.settings", this);
                    this.getView().addDependent(this.oDialogFragment);
                }
                return this.oDialogFragment;
            },
            onInit: function() {
                this.oComp = this.getOwnerComponent();

                sap.ui.getCore().attachValidationError(function(evt) {
                    var control = evt.getParameter("element");
                    if (control && control.setValueState) {
                        control.setValueState("Error");
                    }
                });
                sap.ui.getCore().attachValidationSuccess(function(evt) {
                    var control = evt.getParameter("element");
                    if (control && control.setValueState) {
                        control.setValueState("None");
                    }
                });

            },

            updateIcon: function() {
                var view = this.getView();
                var btn = view.byId("registerButton");
                var oSettingsModel = view.getModel("settings");
                var showBtnIcon = oSettingsModel.getData().show_button_icon.value;
                if (showBtnIcon) {
                    btn.setIcon("sap-icon://decision");
                } else {
                    btn.setIcon("");
                }

            },
            openDialog: function() {

                this.getDialogFragment().open();
            },

            onWidgetSettingsDialogSave: function() {
                this.oComp.fireEvent("save.settings",
                    this.getView().getModel("settings").getData());
                this.getDialogFragment().close();
            },

            onBeforeRendering: function() {
                this.updateIcon();
            },
            onWidgetSettingsDialogClose: function() {
                this.oComp.fireEvent("revert.settings");
                this.getDialogFragment().close();
            },

            onRegister: function() {
                if (!this.oFileExistsDialog) {
                    this.oFileExistsDialog = sap.ui.xmlfragment("registrationview.local.view.registration", this);
                    this.getView().addDependent(this.oFileExistsDialog);
                }
                this.oFileExistsDialog.open();
            },

            isValidate: function() {

                var isValid = true;
                var core = sap.ui.getCore();
                var inputs = [
                    core.byId("partner-registeration-form-firstnameInput"),
                    core.byId("partner-registeration-form-lastnameInput"),
                    core.byId("partner-registeration-form-emailInput")
                ];

                // check that inputs are not empty
                // this does not happen during data binding as this is only triggered by changes
                jQuery.each(inputs, function(i, input) {
                    if (!input.getValue()) {
                        input.setValueState("Error");
                    }
                });
                jQuery.each(inputs, function(i, input) {
                    if (input.getValueState() === "Error") {
                        isValid = false;
                        return false;
                    }
                });
                return isValid;

            },
            register: function() {
                if (!this.isValidate()) {
                    return;
                }

                var view = this.getView();
                var m = view.getModel("registrationDataModel");
                var registrationData = m.getData();
                var candidateFirstName = registrationData.postData.candidateFirstName;
                var candidateLastName = registrationData.postData.candidateLastName;
                var mail = registrationData.postData.mail;

                var registrationCallURL = "/fiori/public/v1/services/invitations/publicidpregister/" + this.oComp.getSiteId() + "?platform=C4C&fname=" + candidateFirstName + "&lname=" + candidateLastName + "&email=" + mail;

                registrationData.callback.displayMessage = false;

                m.refresh();
                var oBundle = this.oComp.oBundle;
                jQuery.ajax({
                    url: registrationCallURL,
                    success: function() {
                        registrationData.callback.msg = oBundle.getText("SUCCESS_MESSAGE");
                        registrationData.callback.status = "Success";
                        registrationData.callback.displayMessage = true;
                        registrationData.callback.showFields = false;
                        registrationData.postData = {
                            candidateFirstName: "",
                            candidateLastName: "",
                            mail: ""
                        };
                        registrationData.requestSent = false;
                        m.refresh();

                    },
                    error: function(err) {
                        try {

                            registrationData.callback.status = "Error";
                            registrationData.callback.displayMessage = true;
                            //_selfView.setBusy(false);
                            var errorStatus = err.status;
                            registrationData.callback.displayBusyIndicator = false;
                            if (errorStatus === 409) {
                                registrationData.callback.msg = oBundle.getText("ERROR_USER_ALREADY_EXIST");
                            } else if (errorStatus === 400) {
                                registrationData.callback.msg = oBundle.getText("ERROR_MISSING_INFORMATION");
                            } else if (errorStatus === 500 || errorStatus === 404) {
                                registrationData.callback.msg = err.responseJSON.error.msg;
                            } else {
                                registrationData.callback.msg = oBundle.getText("ERROR_MESSAGE_BACKEND");
                            }

                            m.refresh();
                        } catch (e) {
                            registrationData.callback.status = "Error";
                            registrationData.callback.displayMessage = true;
                            registrationData.callback.msg = oBundle.getText("ERROR_MESSAGE_BACKEND");
                            m.refresh();

                        }
                    },
                    type: "GET",
                    contentType: "application/json;charset=utf-8"
                });

            },
            closeDialog: function() {

                var core = sap.ui.getCore();
                var inputs = [
                    core.byId("partner-registeration-form-firstnameInput"),
                    core.byId("partner-registeration-form-lastnameInput"),
                    core.byId("partner-registeration-form-emailInput")
                ];

                // check that inputs are not empty
                // this does not happen during data binding as this is only triggered by changes
                jQuery.each(inputs, function(i, input) {
                    input.setValue("");
                    input.setValueState("None");
                });

                this.oComp.resetRegistrationDataModel();
                this.oFileExistsDialog.close();
            },
            enableSaveByInput: function(value) {
                return value !== "";
            },

            typeEMail: sap.ui.model.SimpleType.extend("email", {
                formatValue: function(oValue) {
                    return oValue;
                },
                parseValue: function(oValue) {
                    //parsing step takes place before validating step, value can be altered
                    return oValue;
                },
                validateValue: function(oValue) {
                    // The following Regex is NOT a completely correct one and only used for demonstration purposes.
                    // RFC 5322 cannot even checked by a Regex and the Regex for RFC 822 is very long and complex.
                    var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                    if (!oValue.match(mailregex)) {

                        throw new sap.ui.model.ValidateException("'" + oValue + "' is not a valid email address");
                    }
                }
            })
        });

    });
}());
