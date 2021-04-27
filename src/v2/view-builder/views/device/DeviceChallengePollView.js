import { $, loc } from 'okta';
import { BaseForm, BaseFormWithPolling, BaseFooter, BaseView } from '../../internals';
import Logger from '../../../../util/Logger';
import BrowserFeatures from '../../../../util/BrowserFeatures';
import Enums from '../../../../util/Enums';
import { CANCEL_POLLING_ACTION } from '../../utils/Constants';
import Link from '../../components/Link';
import { doChallenge } from '../../utils/ChallengeViewUtil';
import OktaVerifyAuthenticatorHeader from '../../components/OktaVerifyAuthenticatorHeader';

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
      doChallenge(this);
      this.startPolling();
    },

    onPollingFail() {
      this.$('.spinner').hide();
      this.stopPolling();
    },

    remove() {
      BaseForm.prototype.remove.apply(this, arguments);
      this.stopProbing();
      this.stopPolling();
    },

    getDeviceChallengePayload() {
      return this.options.currentViewState.relatesTo.value;
    },

    doLoopback(authenticatorDomainUrl = '', ports = [], challengeRequest = '', probeTimeoutMillis = 100) {
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
          timeout: 3000 // authenticator should respond within 3000ms for challenge request
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
              onPortFail();
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
    const isFallbackApproach = [
      Enums.CUSTOM_URI_CHALLENGE,
      Enums.UNIVERSAL_LINK_CHALLENGE
    ].includes(this.options.currentViewState.relatesTo.value.challengeMethod);
    if (isFallbackApproach) {
      this.links = [
        {
          name: 'sign-in-options',
          type: 'link',
          label: loc('oie.verification.switch.authenticator', 'login'),
          href: this.settings.get('baseUrl')
        }
      ];
      BaseFooter.prototype.initialize.apply(this, arguments);
    } else {
      this.add(Link, {
        options: {
          name: 'cancel-authenticator-challenge',
          label: loc('loopback.polling.cancel.link', 'login'),
          actionPath: CANCEL_POLLING_ACTION,
        }
      });
    }
  }
});

export default BaseView.extend({
  Header: OktaVerifyAuthenticatorHeader,
  Body,
  Footer
});
