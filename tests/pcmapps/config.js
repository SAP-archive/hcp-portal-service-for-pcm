
 /*
* Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
*/

 entityNames = [
     "Account",
     "Appointment",
     "DealRegistration",
     "Lead",
     "Opportunity",
     "Partner",
     "PartnerContact",
     "Task"
 ];

 entityNamesBlackList = {
     table: ["Partner", "PartnerContact"],
     details: [],
     creator: []
 };

 function getEntityNames(eType){
     var newEntityNames = entityNames.filter(function(entity) {
         return entityNamesBlackList[eType].indexOf(entity) === -1;
     });
     return newEntityNames;
 };
