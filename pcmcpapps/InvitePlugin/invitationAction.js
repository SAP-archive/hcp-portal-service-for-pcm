/**
 * Created by I075528 on 11/23/14.
 */

(function () {
    "use strict";
    var semanticObjectName = 'Invite',
        actionName = 'Display',
        CROSS_APP_NAV_SERVICE = 'CrossApplicationNavigation',
        RENDERERS_PREFIX = 'sap.ushell.renderers.fiori2',
        BOOTSTRAP_PLUGIN_FAILED_MSG = 'BootstrapPlugin - failed to apply renderer extensions, because "sap.ushell.renderers.fiori2.RendererExtensions" not available',
        BOOTSTRAP_PLUGIN_SUCCEED_MSG = 'BootstrapPlugin - inserting a sample button onto the shell header after renderer was loaded',
        oBundle;

    function loadMessageBundleResources() {
        oBundle = new sap.ui.model.resource.ResourceModel({
            bundleUrl: jQuery.sap.getModulePath(
                "c4c.inviteaction/i18n/Messages",
                ".properties"
            )
        }).getResourceBundle();
    }

    function getString(key) {
        return oBundle.getText(key);
    }

    //init the injection ActionSheetButton
    function init() {
        jQuery.sap.log.debug("BootstrapPlugin - module loaded");

        loadMessageBundleResources();
        //navigation to fiori app
        function navigate() {
            var oCrossAppNavigator;
            try {
                if (sap.ushell && sap.ushell.services && sap.ushell.services.AppConfiguration) {
                    oCrossAppNavigator = sap.ushell.Container.getService(CROSS_APP_NAV_SERVICE);
                    oCrossAppNavigator.toExternal({
                        target: {
                            semanticObject: semanticObjectName,
                            action: actionName
                        }
                    });
                }
            } catch (e) {
                return undefined;
            }
        }

        /*global jQuery, sap, localStorage, window */
        var oRendererExtensions = jQuery.sap.getObject(RENDERERS_PREFIX + '.RendererExtensions');

        function applyRendererExtensions() {
            //if role name have the permissions

            jQuery.sap.log.debug(BOOTSTRAP_PLUGIN_SUCCEED_MSG);

            if (!oRendererExtensions) {
                oRendererExtensions = jQuery.sap.getObject(RENDERERS_PREFIX + '.RendererExtensions');
            }

            if (oRendererExtensions) {
                oRendererExtensions.addOptionsActionSheetButton(new sap.m.Button({
                    tooltip: getString("invite_action_menu_btn_tooltip"),
                    text: getString("invite_action_menu_btn"),
                    icon: "sap-icon://group",
                    press: function () {
                        navigate();
                    }
                }).addStyleClass('actionSheetButton'));
            } else {
                jQuery.sap.log.error(BOOTSTRAP_PLUGIN_FAILED_MSG);
            }
        }

        // the module could be loaded asynchronously, the shell does not guarantee a loading order;
        // therefore, we have to consider both cases, i.e. renderer is loaded before or after this module
        if (oRendererExtensions) {
            // fiori2 renderer already loaded, apply extensions directly
            applyRendererExtensions();
        }
    }

    var RendererLoadedPromise = new jQuery.Deferred(),
        renderer = sap.ushell.Container.getRenderer("fiori2");

    function renderLoaded(){
        RendererLoadedPromise.resolve();
    }

    if (renderer && renderer.addToolAreaItem){
        RendererLoadedPromise.resolve();
    } else {
        // Subscribe to Rendere loaded event to use left panel ushell Api
        sap.ui.getCore().getEventBus().subscribe(RENDERERS_PREFIX + ".Renderer", "rendererLoaded", renderLoaded, this);
    }

    jQuery.when(RendererLoadedPromise).done(function(){
        init();
    });


}());
