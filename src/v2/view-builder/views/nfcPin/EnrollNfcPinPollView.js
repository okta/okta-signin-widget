import { loc } from '@okta/courage';
import { BaseFooter, BaseOktaVerifyChallengeView } from '../../internals';
import { CANCEL_POLLING_ACTION, AUTHENTICATION_CANCEL_REASONS } from '../../utils/Constants';
import Link from '../../components/Link';
import { doChallenge, cancelPollingWithParams } from '../../utils/ChallengeViewUtil';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseOktaVerifyChallengeView.extend({
  pollingCancelAction: CANCEL_POLLING_ACTION,

  getDeviceChallengePayload() {
    // For enrollment, contextualData has setupNfcUrl — map to challengeMethod/href format
    const contextualData = this.options.currentViewState.relatesTo?.value?.contextualData;
    if (contextualData?.setupNfcUrl) {
      return {
        challengeMethod: 'CUSTOM_URI',
        href: contextualData.setupNfcUrl,
      };
    }
    return contextualData?.challenge?.value
      || this.options.currentViewState.relatesTo?.value;
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
