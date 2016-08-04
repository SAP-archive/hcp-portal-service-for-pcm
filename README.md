# SAP HANA Cloud Platform, Portal Service  Partner Channel Management Configuration Guide


The SAP HCP portal service for partner channel management configuration guide provides all you need to deploy PCM solution on your HCP account and connect it to your SAP Cloud for Customer (C4C) tenant and SAP Cloud Identity (SCI) tenant.

##  1. Prerequisites

*	SAP HANA Cloud Platform (HCP) productive account (the solution does not work with a trial account)
*	Portal Service enabled from the HCP account cockpit, Services tab
*	SAP Cloud Identity (SCI) tenant
*	SAP Cloud for Customer (C4C) tenant
*	Users:
     -  Admin access to HCP account.
	 -  TENANT_ADMIN user for Portal Service.
     -  C4C admin user.
     - 	SCI admin user.
## 2. Configure Your Account
### 2.1 	Deploy PCM artifacts
 1. Navigate to	[ https://github.com/SAP/hcp-portal-service-for-pcm/releases](https://github.com/SAP/hcp-portal-service-for-pcm/releases)
 2. Prepare content for deployment. There are two options:
     + Download ZIP files from releases folder.
     + Clone and Create Zip:
         1.  	Clone the repository to your computer, or download it as a ZIP file by clicking the Clone or download button and selecting Download ZIP, and extract its contents.
         2. 	Archive every folder content to ZIP files (pcmapps, pcmcpapps, pcmsitetemplate).

 3. Import the following ZIP files to SAP Web IDE and deploy them to your account:
    * pcmapps.zip	(Business applications)
    * pcmcpapps.zip	(Invitation application)
    * pcmsitetemplate.zip	(Site template)
 4. (Optional):Preview your site template in WEB-IDE.
 ### 2.2	Import scilogin plugin
   1.	Go to [https://github.com/SAP/sap-hcp-portal-service-samples.](https://github.com/SAP/sap-hcp-portal-service-samples)
   2.	Download the ZIP.
   3.	Extract the ZIP to your desktop.
   4.	Import sciloginplugin.zip to SAP Web IDE.
   5.	Deploy the plugin to your account.

### 2.3 Create PCM roles
   1. Open the SAP HCP account cockpit and navigate to Services >> Portal Service >> Configure Portal Service >> Roles.
   2. Create new roles:
       * PartnerManager.
       * PartnerContact.
       * Applicant.
       * Candidate.
###  2.4 Create email template in SCI
   1.	Download SAPID Mail Templates.zip as an example.
   2.	Open a BCP ticket BC-NEO-IAM. Use the email templates you downloaded and adjust it according to your needs.
### 2.5	Set up trust between the customer account and SCI (for log-on scenario).

   ##### 2.5.1	Customer HCP Account Settings
   1.	Open the customer HCP account cockpit and navigate to the Trust screen.
   2.	Edit the Local Service Provider and change the Configuration Type to Custom.
   3.	Click the Generate Key Pair button to fill up the Signing Key and Signing Certificate.
   4.	Change the Principle Propagation value to Enabled.
   5.	Save the settings and download the metadata by clicking the Get Metadata link.
   6.	Go to the Trusted Identity Provider tab and click the Add Trusted Identity Provider link.
   7.	Browse and upload the IDP metadata file.

        TIP: You can get the IDP (SCI) metadata file by navigating to: https://<your SCI account name>.<account domain; example:   accounts400>.ondemand.com/saml2/metadata
   8.	In the General tab, change the User ID Source to attribute, and then in the Source Value field, put mail.
   9.	In the Attributes tab, click Add Assertion-Based Attribute to add the following attributes mapping (after adding one pair, click the link again to add more input fields):


    Assertion Attribute |  Principle Attribute
    --- | ---
    first_name | firstname
    last_name  | lastname
    Mail       | email

   10.	Save and close

   ##### 2.5.2	SCI IDP Settings:
   1.	Open the admin page of your SCI IDP account
   https://<your SCI account name>.<account domain; Example:  accounts400>.ondemand.com/admin/
   2.	Click Applications.
   3.	Add a new application and choose the customer's name as the application name.
   4.	Open the SAML 2.0 Configuration and upload the customer's account SP metadata, which you downloaded already.
   5.	Save and close.


  You should now be able to log on to the Portal Service’s Admin Space with the user ID
  (email) that was assigned to it when the customer account was provisioned to the Portal Service.
  If the user cannot log in, make sure that the user was added to the SCI account (go to the SCI admin page and upload the user with his/her full details in a CSV file format. To see the required details, you can export a user to a CSV file and edit the file).

  ##### 2.6	Set up trust between the customer account and SCI API (for SAP ID invitation flow)
   1. Request a signed certificate from [SAP Support Portal](http://help.sap.com/disclaimer?site=https://support.sap.com/support-programs-services/services/trust-center/sso.html) (open in Internet Explorer only)
   2. Open a KeyStore Explorer application, and then:
       1. Click on Create a new KeyStore.
       2. Choose JKS type.
       3. Go to Tools >> Import Key Pair.
       4. Choose PKCS #12.
       5. Enter the certificate password under Decryption Password, and choose the certificate file.
       6. Choose an alias (or leave the default).
       7. You are now requested to choose a new password - enter the original certificate password.
       8. Save the JKS file with the name sapid.jks. When requested to choose a new password, choose again the original certificate password.
   3. On the customer HCP account, go to Destinations and upload the JKS file using the certificates upload option.
   4. On the SCI IDP customer application, go to Certificate for API Authentication and upload the public part of the P12 certificate you created. For getting the public part, do the following:
      1. Open IE only and go to Internet Options >> Content >> Certificates >> Import.
      2. Browse to the P12 file.
      3. Type the password you chose when you created the certificate (leave check-boxes as default).
      4. Place the certificate in the Personal store and click Finish.
      5. Find the certificate you uploaded under the Personal store and click Export.
      6. Click Next until you reach the file format options.
      7. Choose Base-64 encoded X.509 (.CER) format.
      8. Choose a file name for the exported file and click Finish.
      9. Open the exported file with notepad, and copy the entire text (including the header and footer).
      10. Paste the text into the proper section of SCI as described above.
   #### 2.7	Set up trust between the customer account and SAP C4C backend (for C4C invitation flow)
   1. Log in to C4C backend with an Admin work center authorization.
   2. Under the Administrator section, go to Common Tasks and click on Configure OAuth 2.0 Identity Provider.
   3. Create a new Config for OAuth Identity Provider.

![Image of Yaktocat](https://octodex.github.com/images/yaktocat.png)


