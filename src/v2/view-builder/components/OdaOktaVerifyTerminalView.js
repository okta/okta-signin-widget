import { View, loc } from 'okta';
import hbs from 'handlebars-inline-precompile';
import Enums from 'util/Enums';

export default View.extend({
  template: hbs`
    <p class="explanation">
      {{i18n code="enroll.explanation.p1" bundle="login" arguments="appStoreName"}}
    </p>
    <p class="explanation">
      {{{i18n code="enroll.explanation.p2" bundle="login"}}}
      <br>
      <span class="no-translate">
      {{signInUrl}}
      </span>
    </p>
    <div data-se="app-store">
      <a href="{{appStoreLink}}" target="_blank">
        <div class="app-store-logo {{appStoreLogoClass}}"></div>
      </a>
    </div>
    <div class="copy">
      {{copy}}
    </div>
  `,

  getTemplateData() {
    const deviceEnrollment = this.options.appState.get('deviceEnrollment');
    const platform = (deviceEnrollment.platform || '').toLowerCase();
    const templateData = {
      signInUrl: deviceEnrollment.signInUrl,
      appStoreLogoClass: `${platform}-app-store-logo`,
      copy: loc(`enroll.copy.${platform}`, 'login'),
    };
    if (platform === Enums.IOS) {
      templateData.appStoreName = loc('enroll.appleStore', 'login');
      templateData.appStoreLink = Enums.OKTA_VERIFY_APPLE_APP_STORE_URL;
    }
    if (platform === Enums.ANDROID) {
      templateData.appStoreName = loc('enroll.googleStore', 'login');
      templateData.appStoreLink = Enums.OKTA_VERIFY_GOOGLE_PLAY_STORE_URL;
    }
    return templateData;
  },
});
