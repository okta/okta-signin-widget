import { loc } from '@okta/courage';
import { BaseFooter, BaseOktaVerifyChallengeView } from '../../internals';
import Link from '../../components/Link';
import { doChallenge } from '../../utils/ChallengeViewUtil';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseOktaVerifyChallengeView.extend({
  getDeviceChallengePayload() {
    // contextualData.challenge.value contains { challengeMethod, href, downloadHref }
    return this.options.currentViewState.relatesTo?.value?.contextualData?.challenge?.value
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
