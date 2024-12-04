import { loc, createCallout } from '@okta/courage';
import { BaseFooter, BaseView, BaseOktaVerifyChallengeView } from '../../internals';
import Enums from '../../../../util/Enums';
import {
  CANCEL_POLLING_ACTION,
  IDENTIFIER_FLOW,
  AUTHENTICATION_CANCEL_REASONS,
} from '../../utils/Constants';
import Link from '../../components/Link';
import { doChallenge, cancelPollingWithParams } from '../../utils/ChallengeViewUtil';
import OktaVerifyAuthenticatorHeader from '../../components/OktaVerifyAuthenticatorHeader';
import { getSignOutLink } from '../../utils/LinksUtil';
import CustomAccessDeniedErrorMessage from '../shared/CustomAccessDeniedErrorMessage';

const CUSTOM_ACCESS_DENIED_KEY = 'security.access_denied_custom_message';

const Body = BaseOktaVerifyChallengeView.extend({
  pollingCancelAction: CANCEL_POLLING_ACTION,

  getDeviceChallengePayload() {
    return this.options.currentViewState.relatesTo.value;
  },

  doChallenge() {
    doChallenge(this, IDENTIFIER_FLOW);
  },

  onPollingFail() {
    BaseOktaVerifyChallengeView.prototype.onPollingFail.apply(this, arguments);
    // When SIW receives form error, polling is already stopped
    // SIW needs to update footer link from /poll/cancel to /idp/idx/cancel
    const data = { label: loc('loopback.polling.cancel.link.with.form.error', 'login') };
    this.options.appState.trigger('updateFooterLink', data);
  },

  showCustomFormErrorCallout(error, messages) {
    const responseJSON = error.responseJSON;
    let options = {
      type: 'error',
      className: 'okta-verify-uv-callout-content',
      subtitle: responseJSON.errorSummary,
    };

    const containsSignedNonceError = responseJSON.errorSummaryKeys &&
      responseJSON.errorSummaryKeys.some((key) => key.includes('auth.factor.signedNonce.error'));
    if (containsSignedNonceError) {
      options.title = loc('user.fail.verifyIdentity', 'login');
    }

    const containsCustomAccessDeniedError = responseJSON.errorSummaryKeys &&
      responseJSON.errorSummaryKeys.some((key) => key.includes('security.access_denied_custom_message'));
    if(containsCustomAccessDeniedError) {
      const message = messages?.find(message => message.i18n.key === CUSTOM_ACCESS_DENIED_KEY);
      if (!message) {
        return false;
      }
      options = {
        type: 'error',
        content: new CustomAccessDeniedErrorMessage({
          message: responseJSON.errorSummary,
          links: message.links,
        })
      };
    }

    this.showMessages(createCallout(options));
    return true;
  },
});

const Footer = BaseFooter.extend({
  initialize() {
    this.listenTo(this.options.appState, 'updateFooterLink', this.handleUpdateFooterLink);
    if (this.isFallbackApproach() && !this.isFallbackDelayed()) {
      BaseFooter.prototype.initialize.apply(this, arguments);
    } else {
      this.backLink = this.add(Link, {
        options: {
          name: 'cancel-authenticator-challenge',
          label: loc('loopback.polling.cancel.link', 'login'),
          clickHandler: () => {
            cancelPollingWithParams(
              this.options.appState,
              CANCEL_POLLING_ACTION,
              AUTHENTICATION_CANCEL_REASONS.USER_CANCELED,
              null
            );
          },
        }
      }).last();
    }
  },

  handleUpdateFooterLink(data) {
    // only update link for loopback
    if (!this.isFallbackApproach() || this.isFallbackDelayed()) {
      this.backLink && this.backLink.remove();
      this.backLink = this.add(Link, {
        options: getSignOutLink(this.options.settings, data)[0]
      }).last();
    } 
  },

  isFallbackApproach() {
    return [
      Enums.CUSTOM_URI_CHALLENGE,
      Enums.UNIVERSAL_LINK_CHALLENGE,
      Enums.APP_LINK_CHALLENGE
    ].includes(this.options.currentViewState.relatesTo.value.challengeMethod);
  },

  isFallbackDelayed() {
    // only delay showing the reopen Okta Verify button for the app link approach for now
    // until we have more data shows other approaches have the slow cold start problem of the Okta Verify app as well
    return this.options.currentViewState.relatesTo.value.challengeMethod === Enums.APP_LINK_CHALLENGE;
  },
});

export default BaseView.extend({
  Header: OktaVerifyAuthenticatorHeader,
  Body,
  Footer
});
