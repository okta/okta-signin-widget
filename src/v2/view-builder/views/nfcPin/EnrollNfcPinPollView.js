import { loc } from '@okta/courage';
import { BaseFooter, BaseOktaVerifyChallengeView } from '../../internals';
import { CANCEL_POLLING_ACTION, AUTHENTICATION_CANCEL_REASONS } from '../../utils/Constants';
import Link from '../../components/Link';
import { doChallenge, cancelPollingWithParams } from '../../utils/ChallengeViewUtil';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseOktaVerifyChallengeView.extend({
  pollingCancelAction: CANCEL_POLLING_ACTION,

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
        name: 'cancel-authenticator-challenge',
        label: loc('goback', 'login'),
        clickHandler: () => {
          cancelPollingWithParams(
            this.options.appState,
            CANCEL_POLLING_ACTION,
            AUTHENTICATION_CANCEL_REASONS.USER_CANCELED,
            null
          );
        },
      }
    });
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer,
});
