(function(){
	"use strict";
	/*global   sap*/
sap.ui.jsview("c4c.manage-invitations.local.view.App", {

	getControllerName: function () {
		return "c4c.manage-invitations.local.view.App";
	},
	createContent: function () {
		//to avoid scroll bars on desktop the root view must be set to block display
		this.setDisplayBlock(true);
		//create app
		this.app = new sap.m.App();
		//load the invitation page
		var invitation = sap.ui.xmlview("Invitation", "c4c.manage-invitations.local.view.Invitation");
		invitation.getController().nav = this.getController();
		this.app.addPage(invitation, true);

		return this.app;
	}
});}());
