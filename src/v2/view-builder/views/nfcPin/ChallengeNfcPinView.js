import { loc } from '@okta/courage';
import { BaseFooter, BaseForm, BaseOktaVerifyChallengeView } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import { getFactorPageCustomLink, getSwitchAuthenticatorLink } from '../../utils/LinksUtil';
import { doChallenge } from '../../utils/ChallengeViewUtil';

/**
 * Shown when NFC card scan is needed.
 * Matches FastPass CUSTOM_URI behavior: auto-launches OV, shows "Click Open Okta Verify" screen.
 */
const DeviceChallengeBody = BaseOktaVerifyChallengeView.extend({
  getDeviceChallengePayload: function() {
    const authenticator = this.options.appState.get('currentAuthenticatorEnrollment')
      || this.options.appState.get('currentAuthenticator');
    return authenticator?.contextualData?.challenge?.value || {};
  },

  doChallenge: function() {
    doChallenge(this);
  },
});

/**
 * Shown after NFC card is verified — user enters their PIN.
 */
const PinEntryBody = BaseForm.extend({
  className: 'nfc-pin-challenge',

  title: function() {
    return loc('oie.nfc_pin.verify.title', 'login');
  },

  save: function() {
    return loc('mfa.challenge.verify', 'login');
  },

  getUISchema: function() {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    return uiSchemas.map(function(field) {
      if (field.name === 'credentials.passcode') {
        return Object.assign({}, field, {
          label: loc('oie.nfc_pin.verify.pinLabel', 'login'),
        });
      }
      return field;
    });
  },
});

const DeviceChallengeFooter = BaseFooter.extend({
  links: function() {
    return getSwitchAuthenticatorLink(this.options.appState);
  },
});

const PinEntryFooter = BaseFooter.extend({
  links: function() {
    const links = [];
    const hasEnrollmentRecover = !!this.options.appState.get('currentAuthenticatorEnrollment')?.recover;
    const hasAuthenticatorRecover = !!this.options.appState.get('currentAuthenticator')?.recover;
    if (hasEnrollmentRecover || hasAuthenticatorRecover) {
      links.push({
        type: 'link',
        label: loc('oie.nfc_pin.forgot.pin', 'login'),
        name: 'forgot-pin',
        actionPath: hasEnrollmentRecover
          ? 'currentAuthenticatorEnrollment-recover'
          : 'currentAuthenticator-recover',
      });
    }
    return links
      .concat(getFactorPageCustomLink(this.options.appState, this.options.settings))
      .concat(getSwitchAuthenticatorLink(this.options.appState));
  },
});

export default BaseAuthenticatorView.extend({
  initialize: function() {
    BaseAuthenticatorView.prototype.initialize.apply(this, arguments);

    const appState = this.options.appState;
    const authenticator = appState.get('currentAuthenticatorEnrollment')
      || appState.get('currentAuthenticator');

    if (authenticator?.contextualData?.challenge) {
      this.Body = DeviceChallengeBody;
      this.Footer = DeviceChallengeFooter;
    } else {
      this.Body = PinEntryBody;
      this.Footer = PinEntryFooter;
    }
  },
});
