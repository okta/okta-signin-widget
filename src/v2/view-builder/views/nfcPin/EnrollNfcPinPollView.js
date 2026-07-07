import { loc } from '@okta/courage';
import { BaseFooter, BaseOktaVerifyChallengeView } from '../../internals';
import { AUTHENTICATOR_CANCEL_ACTION } from '../../utils/Constants';
import Link from '../../components/Link';
import { doChallenge } from '../../utils/ChallengeViewUtil';
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
    doChallenge(this);
  },
});

const Footer = BaseFooter.extend({
  initialize() {
    this.add(Link, {
      options: {
        name: 'cancel',
        label: loc('goback', 'login'),
        clickHandler: () => {
          this.options.appState.trigger('invokeAction', 'cancel');
        },
      }
    });
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer,
});
