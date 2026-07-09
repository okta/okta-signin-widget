import { View, loc, createButton } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { BaseFooter, BaseOktaVerifyChallengeView } from '../../internals';
import { appendLoginHint } from '../../utils/ChallengeViewUtil';
import { getSwitchAuthenticatorLink } from '../../utils/LinksUtil';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseOktaVerifyChallengeView.extend({
  getDeviceChallengePayload() {
    return this.options.currentViewState.relatesTo?.value?.contextualData?.challenge?.value || {};
  },

  doChallenge() {
    const deviceChallenge = this.getDeviceChallengePayload();
    const loginHint = this.options.settings?.get('username');

    // NFC-specific intermediate screen
    this.title = loc('oie.nfc_pin.challenge.verify.title', 'login');

    this.add(View.extend({
      className: 'skinny-content',
      template: hbs`
        <p>{{description}}</p>
      `,
      getTemplateData: () => ({
        description: loc('oie.nfc_pin.challenge.verify.description', 'login'),
      }),
    }));

    // "Open Okta Verify" button as manual fallback
    this.add(createButton({
      className: 'ul-button button button-wide button-primary',
      title: loc('oktaVerify.open.button', 'login'),
      id: 'launch-ov',
      click: () => {
        this.doCustomURI();
      }
    }));

    // Launch CUS silently
    if (deviceChallenge.href) {
      this.customURI = appendLoginHint(deviceChallenge.href, loginHint);
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
