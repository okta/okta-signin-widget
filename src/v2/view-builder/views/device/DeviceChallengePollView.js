import { $, loc, createCallout } from 'okta';
import {BaseFormWithPolling, BaseFooter, BaseView} from '../../internals';
import Logger from '../../../../util/Logger';
import BrowserFeatures from '../../../../util/BrowserFeatures';
import Enums from '../../../../util/Enums';
import { CANCEL_POLLING_ACTION, CHALLENGE_TIMEOUT, IDENTIFIER_FLOW } from '../../utils/Constants';
import Link from '../../components/Link';
import { doChallenge } from '../../utils/ChallengeViewUtil';
import OktaVerifyAuthenticatorHeader from '../../components/OktaVerifyAuthenticatorHeader';
import { getSignOutLink } from '../../utils/LinksUtil';

const SIGNED_NONCE_ERROR_KEY = 'auth.factor.signedNonce.error';

const request = (opts) => {
  const ajaxOptions = Object.assign({
    method: 'GET',
    contentType: 'application/json',
  }, opts);
  return $.ajax(ajaxOptions);
};

const Body = BaseFormWithPolling.extend(
  {
    noButtonBar: true,

    className: 'ion-form device-challenge-poll',

    events: {
      'click #launch-ov': function(e) {
        e.preventDefault();
        this.doCustomURI();
      }
    },

    initialize() {
      BaseFormWithPolling.prototype.initialize.apply(this, arguments);
      this.listenTo(this.model, 'error', this.onPollingFail);
      doChallenge(this, IDENTIFIER_FLOW);
      this.startPolling();
    },

    onPollingFail() {
      this.$('.spinner').hide();
      this.stopPolling();
      // When SIW receives form error, polling is already stopped
      // SIW needs to update footer link from /poll/cancel to /idp/idx/cancel
      const data = { label: loc('loopback.polling.cancel.link.with.form.error', 'login') };
      this.options.appState.trigger('updateFooterLink', data);
    },

    remove() {
      BaseFormWithPolling.prototype.remove.apply(this, arguments);
      this.stopProbing();
      this.stopPolling();
    },

    getDeviceChallengePayload() {
      return this.options.currentViewState.relatesTo.value;
    },

    doLoopback(deviceChallenge) {
      let authenticatorDomainUrl = deviceChallenge.domain !== undefined ? deviceChallenge.domain : '';
      let ports = deviceChallenge.ports !== undefined ? deviceChallenge.ports : [];
      let challengeRequest = deviceChallenge.challengeRequest !== undefined ? deviceChallenge.challengeRequest : '';
      let probeTimeoutMillis = deviceChallenge.probeTimeoutMillis !== undefined ?
        deviceChallenge.probeTimeoutMillis : 100;
      let currentPort;
      let foundPort = false;
      let countFailedPorts = 0;

      const getAuthenticatorUrl = (path) => {
        return `${authenticatorDomainUrl}:${currentPort}/${path}`;
      };

      const checkPort = () => {
        return request({
          url: getAuthenticatorUrl('probe'),
          /*
          OKTA-278573 in loopback server, SSL handshake sometimes takes more than 100ms and thus needs additional
          timeout however, increasing timeout is a temporary solution since user will need to wait much longer in
          worst case.
          TODO: Android timeout is temporarily set to 3000ms and needs optimization post-Beta.
          OKTA-365427 introduces probeTimeoutMillis; but we should also consider probeTimeoutMillisHTTPS for
          customizing timeouts in the more costly Android and other (keyless) HTTPS scenarios.
          */
          timeout: BrowserFeatures.isAndroid() ? 3000 : probeTimeoutMillis
        });
      };

      const onPortFound = () => {
        return request({
          url: getAuthenticatorUrl('challenge'),
          method: 'POST',
          data: JSON.stringify({ challengeRequest }),
          timeout: CHALLENGE_TIMEOUT // authenticator should respond within 5 min (300000ms) for challenge request
        });
      };

      const onFailure = () => {
        Logger.error(`Something unexpected happened while we were checking port ${currentPort}.`);
      };

      const onPortFail = () => {
        countFailedPorts++;
        if (countFailedPorts === ports.length) {
          Logger.error('No available ports. Loopback server failed and polling is cancelled.');
          this.options.appState.trigger('invokeAction', CANCEL_POLLING_ACTION);
        }
      };

      const doProbing = () => {
        this.checkPortXhr = checkPort();
        return this.checkPortXhr
          // TODO: can we use standard ES6 promise methods, then/catch?
          .done(() => {
            this.probingXhr = onPortFound();
            return this.probingXhr.done(() => {
              foundPort = true;
              // log in as soon as challenge request is finished
              return this.trigger('save', this.model);
            }).fail((xhr) => {
              Logger.error(`OV challenge response with HTTP code ${xhr.status} ${xhr.responseText}`);
              if (xhr.statusText === 'timeout') {
                foundPort = true;
                return this.trigger('save', this.model);
              } else {
                onPortFail();
              }
            });
          })
          .fail(onFailure);
      };

      let probeChain = Promise.resolve();
      ports.forEach(port => {
        probeChain = probeChain
          .then(() => {
            if (!foundPort) {
              currentPort = port;
              return doProbing();
            }
          })
          .catch(() => {
            Logger.error(`Authenticator is not listening on port ${currentPort}.`);
            onPortFail();
          });
      });
    },

    showCustomFormErrorCallout(error) {
      let options = {
        type: 'error',
        className: 'okta-verify-uv-callout-content',
        subtitle: error.responseJSON.errorSummary,
      };

      const containsSignedNonceError = error.responseJSON.errorSummaryKeys
        .some((key) => key.includes(SIGNED_NONCE_ERROR_KEY));
      if (containsSignedNonceError) {
        options.title = loc('user.fail.verifyIdentity', 'login');
      }

      this.showMessages(createCallout(options));
      return true;
    },

    doCustomURI() {
      this.ulDom && this.ulDom.remove();
      this.ulDom = this.add(`
        <iframe src="${this.customURI}" id="custom-uri-container" style="display:none;"></iframe>
      `).last();
    },

    stopProbing() {
      this.checkPortXhr && this.checkPortXhr.abort();
      this.probingXhr && this.probingXhr.abort();
    },
  },
);

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
          actionPath: CANCEL_POLLING_ACTION,
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
