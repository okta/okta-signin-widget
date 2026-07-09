import { View, loc, createButton } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { BaseFooter, BaseOktaVerifyChallengeView } from '../../internals';
import { AUTHENTICATOR_CANCEL_ACTION } from '../../utils/Constants';
import { getSwitchAuthenticatorLink } from '../../utils/LinksUtil';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseOktaVerifyChallengeView.extend({
  pollingCancelAction: AUTHENTICATOR_CANCEL_ACTION,

  getDeviceChallengePayload() {
    const contextualData = this.options.appState.get('currentAuthenticator')?.contextualData;
    if (contextualData?.setupNfcUrl) {
      return {
        challengeMethod: 'CUSTOM_URI',
        href: contextualData.setupNfcUrl,
      };
    }
    return contextualData?.challenge?.value || {};
  },

  doChallenge() {
    const deviceChallenge = this.getDeviceChallengePayload();

    // NFC-specific intermediate screen for enrollment
    this.title = loc('oie.enroll.nfc_pin.title', 'login');

    this.add(View.extend({
      className: 'skinny-content',
      template: hbs`
        <p>{{description}}</p>
      `,
      getTemplateData: () => ({
        description: loc('oie.enroll.nfc_pin.instructions', 'login'),
      }),
    }));

    // "Open Okta Verify" button as manual fallback
    this.add(createButton({
      className: 'ul-button button button-wide button-primary',
      title: loc('oie.enroll.nfc_pin.openOktaVerify', 'login'),
      id: 'launch-ov',
      click: () => {
        this.doCustomURI();
      }
    }));

    // Launch CUS silently
    if (deviceChallenge.href) {
      this.customURI = deviceChallenge.href;
      this.doCustomURI();
    }
  },
});

const Footer = BaseFooter.extend({
  links: function() {
    return getSwitchAuthenticatorLink(this.options.appState);
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer,
});
