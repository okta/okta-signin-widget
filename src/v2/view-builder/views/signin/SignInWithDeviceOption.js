import { View, createButton, loc } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import Util from '../../../../util/Util';
import Enums from '../../../../util/Enums';
import { UNIVERSAL_LINK_POST_DELAY } from '../../utils/Constants';
import { FORMS } from '../../../ion/RemediationConstants';
import { appendLoginHint } from '../../utils/ChallengeViewUtil';

export default View.extend({
  className: 'sign-in-with-device-option',
  template: hbs`
    <div class="okta-verify-container">
    {{#if signInWithDeviceIsRequired}}
      <div class="signin-with-ov-description">
      </div>
    {{/if}}
    </div>
    {{#unless signInWithDeviceIsRequired}}
    <div class="separation-line">
      <span>{{i18n code="authbutton.divider.text" bundle="login"}}</span>
    </div>
    {{/unless}}
  `,
  initialize() {
    const appState = this.options.appState;
    const deviceChallengePollRemediation = appState.hasRemediationObject(FORMS.LAUNCH_AUTHENTICATOR);
    
    const deviceChallenge = deviceChallengePollRemediation?.relatesTo?.value;
    this.add(createButton({
      className: 'button',
      icon: 'okta-verify-authenticator',
      title: loc('oktaVerify.button', 'login'),
      click() {
        if (this.model.get('identifier')) {
          this.options.settings.set('identifier', encodeURIComponent(this.model.get('identifier')));
        }

        const isUVapproach = deviceChallenge?.challengeMethod === Enums.UNIVERSAL_LINK_CHALLENGE;
        if (isUVapproach) {
          // launch the Okta Verify app
          let deviceChallengeUrl = appendLoginHint(deviceChallenge.href, this.options?.settings?.get('identifier'));
          Util.redirect(deviceChallengeUrl);
        }

        const isAppLinkapproach = deviceChallenge?.challengeMethod === Enums.APP_LINK_CHALLENGE;
        if (isAppLinkapproach) {
          // launch the Okta Verify app
          let deviceChallengeUrl = appendLoginHint(deviceChallenge.href, this.options?.settings?.get('identifier'));
          Util.redirect(deviceChallengeUrl, window, true);
        }

        // OKTA-350084
        // For the universal link (iOS) and app link (Android) approach,
        // we need to 1. launch the Okta Verify app
        // and 2. take the enduser to the next step right away
        // In Safari, when Okta Verify app is not installed, step 1 responds with error immediately,
        // then step 2 will respond with error.
        // To avoid showing the error right before switching to the next UI,
        // wait for 500 milliseconds before invoking step 2
        Util.callAfterTimeout(() => {
          if (this.options.isRequired) {
            appState.trigger('saveForm', this.model);
          } else {
            appState.trigger('invokeAction', FORMS.LAUNCH_AUTHENTICATOR, {'rememberMe': this.model.get('rememberMe')});
          }
        }, isUVapproach || isAppLinkapproach ? UNIVERSAL_LINK_POST_DELAY : 0);
      }
    }), '.okta-verify-container');
  },

  getTemplateData() {
    return {
      signInWithDeviceIsRequired: !!this.options.isRequired,
    };
  },

  postRender() {
    if(this.options.isRequired) {
      const appLabel = this.options.appState.attributes?.app?.label;
      const resourceLabel = appLabel ? loc('oktaVerify.appDescription', 'login', [appLabel]) : 
        loc('oktaVerify.description', 'login');
      const ovDescContainer = this.$el.find('.signin-with-ov-description');
      ovDescContainer.text(resourceLabel);
    }
  }
});
