import { View, createButton, loc } from 'okta';
import hbs from 'handlebars-inline-precompile';
import Util from '../../../../util/Util';
import Enums from '../../../../util/Enums';

export default View.extend({
  className: 'sign-in-with-device-option',
  template: hbs`
    <div class="okta-verify-container">
    {{#if signInWithDeviceIsRequired}}
      <div class="signin-with-ov-description">
        {{i18n code="oktaVerify.description" bundle="login"}}
      </div>
    {{/if}}
    </div>
    {{#unless signInWithDeviceIsRequired}}
    <div class="separation-line">
      <span>{{i18n code="authbutton.divider.text" bundle="login"}}</span>
    </div>
    {{/unless}}
  `,
  initialize () {
    const appState = this.options.appState;
    const deviceChallengePollRemediation = this.options.appState.get('remediations')
      .find(remediation => remediation.name === Enums.LAUNCH_AUTHENTICATOR_REMEDIATION_NAME);
    const deviceChallengeRelatesTo = deviceChallengePollRemediation.relatesTo || {};
    const deviceChallenge = deviceChallengeRelatesTo.value || {};
    this.add(createButton({
      className: 'button',
      title: loc('oktaVerify.button', 'login'),
      click () {
        if (deviceChallenge.challengeMethod && deviceChallenge.challengeMethod === Enums.UNIVERSAL_LINK_CHALLENGE) {
          Util.redirect(deviceChallenge.href);
        }
        if (this.options.isRequired) {
          appState.trigger('saveForm', this.model);
        } else {
          appState.trigger('invokeAction', Enums.LAUNCH_AUTHENTICATOR_REMEDIATION_NAME);
        }
      }
    }), '.okta-verify-container');
  },

  getTemplateData () {
    return {
      signInWithDeviceIsRequired: !!this.options.isRequired,
    };
  }
});