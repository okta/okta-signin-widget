import { BaseFooter, BaseOktaVerifyChallengeView } from '../../internals';
import { doChallenge } from '../../utils/ChallengeViewUtil';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseOktaVerifyChallengeView.extend({
  getDeviceChallengePayload() {
    // contextualData.challenge.value contains { challengeMethod, href, downloadHref }
    return this.options.currentViewState.relatesTo?.value?.contextualData?.challenge?.value
      || this.options.currentViewState.relatesTo?.value
      || {};
  },

  doChallenge() {
    doChallenge(this);
  },
});

const Footer = BaseFooter.extend({});

export default BaseAuthenticatorView.extend({
  Body,
  Footer,
});
