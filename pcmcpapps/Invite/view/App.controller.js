
(function(){
	"use strict";
/*global  jQuery, sap*/
	sap.ui.controller("c4c.manage-invitations.local.view.App", {
	/**
	 * Navigates to another page
	 * @param {string} pageId The id of the next page
	 * @param {sap.ui.model.Context} context The data context to be applied to the next page (optional)
	 */
	to: function (pageId, context) {
		var app = this.getView().app;
		var page;
		// load page on demand
		var invitation = (pageId === "Invitation");
		var pageById = app.getPage(pageId, invitation);
		if (pageById === null) {
				page = sap.ui.view({
				id: pageId,
				viewName: "c4c.manage-invitations.local.view." + pageId,
				type: "XML"
			});
			page.getController().nav = this;
			app.addPage(page, invitation);
			jQuery.sap.log.info("app controller > loaded page: " + pageId);
		}
		// show the page
		app.to(pageId);
		// set data context on the page
		if (context) {
				page = app.getPage(pageId);
			page.setBindingContext(context);
		}
	},
	/**
     Master* Navigates back to a previous page
	 * @param {string} pageId The id of the next page
	 */
	back: function (pageId) {
		this.getView().app.backToPage(pageId);
	}
});}());
