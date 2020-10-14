import { createCallout, View } from 'okta';
import hbs from 'handlebars-inline-precompile';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';

const ODA = 'oda';
const MDM = 'mdm';
const IOS = 'ios';
const ANDROID = 'android';

const Body = BaseForm.extend({
  noButtonBar: true,

  title () {
    return this.enrollmentType === ODA ?
      'Download Okta Verify' : 'Additional setup required';
  },

  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    const deviceEnrollment = this.options.appState.get('deviceEnrollment');
    this.enrollmentType = (deviceEnrollment.name || '').toLowerCase(); // oda/mdm
    switch (this.enrollmentType) {
    case ODA:
      this.add(View.extend({
        template: hbs`
          <div>
            To sign in using Okta Verify, you will need to set up Okta Verify on this device.
            Download the Okta Verify app from {{appStoreName}}.
          </div>
          <div>
            In the app, follow the instructions to add an organizational account.
            When prompted, choose Sign In, then enter the sign-in URL:<br>
            {{signInUrl}}
          </div>
        `,
        getTemplateData () {
          const templateData = {
            signInUrl: deviceEnrollment.signInUrl,
          };
          const platform = (deviceEnrollment.platform || '').toLowerCase();
          if (platform === IOS) {
            templateData.appStoreName = 'App Store';
            templateData.appStoreLogoClass = '';
          }
          if (platform === ANDROID) {
            templateData.appStoreName = 'Google Play Store';
            templateData.appStoreLogoClass = '';
          }

          return templateData;
        },
      }));
      break;
    case MDM:
      this.add(View.extend({
        template: hbs`
          <div>
            To access this app, your device needs to meet your organization's security requirements.
            Follow the instructions below to continue. 
          </div>
          <ol>
            <li>Tap the Copy Link button below.</li>
            <li>On this device, open your browser, then paste the copied link into the address bar.</li>
            <li>Follow the instructions in your browser to set up {{vendor}}, then try accessing this app again.</li>
          </ol>
        `,
        getTemplateData () {
          return deviceEnrollment;
        },
      }));
      break;
    }
  },
});

export default BaseView.extend({
  Body,
  Footer: '', // Sign out link appears in the footer if a cancel object exists in API response
});
