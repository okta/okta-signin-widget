import { $, loc, createCallout } from 'okta';
import { BaseFormWithPolling } from '../../internals';
import Logger from '../../../../util/Logger';
import { CHALLENGE_TIMEOUT } from '../../utils/Constants';
import BrowserFeatures from '../../../../util/BrowserFeatures';
import { doChallenge } from '../../utils/ChallengeViewUtil';

const OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP 
    = 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.desktop';
const OV_UV_ENABLE_BIOMETRICS_FASTPASS_MOBILE 
    = 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.mobile';

const request = (opts) => {
  const ajaxOptions = Object.assign({
    method: 'GET',
    contentType: 'application/json',
  }, opts);
  return $.ajax(ajaxOptions);
};

const Body = BaseFormWithPolling.extend(Object.assign(
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
      BaseFormWithPolling.prototype.remove.apply(this, arguments);
      this.stopPolling();
    },

    getDeviceChallengePayload() {
      return this.options.currentViewState.relatesTo.value.contextualData.challenge.value;
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
        foundPort = true;
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

      const doProbing = () => {
        return checkPort()
          // TODO: can we use standard ES6 promise methods, then/catch?
          .done(onPortFound)
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
            countFailedPorts++;
            Logger.error(`Authenticator is not listening on port ${currentPort}.`);
            if (countFailedPorts === ports.length) {
              Logger.error('No available ports. Loopback server failed and polling is cancelled.');
              this.options.appState.trigger('invokeAction', 'currentAuthenticator-cancel');
            }
          });
      });
    },

    doCustomURI() {
      this.ulDom && this.ulDom.remove();
      this.ulDom = this.add(`
        <iframe src="${this.customURI}" id="custom-uri-container" style="display:none;"></iframe>
      `).last();
    },

    showCustomFormErrorCallout(error) {
      const errorSummaryKeys = error?.responseJSON?.errorSummaryKeys;
      const isBiometricsRequiredMobile = errorSummaryKeys 
          && errorSummaryKeys.includes(OV_UV_ENABLE_BIOMETRICS_FASTPASS_MOBILE);
      const isBiometricsRequiredDesktop = errorSummaryKeys 
          && errorSummaryKeys.includes(OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP);

      if (isBiometricsRequiredMobile || isBiometricsRequiredDesktop) {
        const bulletPoints = [
          loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point1', 'login'),
          loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point2', 'login'),
          loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point3', 'login')
        ];

        // Add an additional bullet point for desktop devices
        if (isBiometricsRequiredDesktop) {
          bulletPoints.push(
            loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point4', 'login')
          );
        }

        const options = {
          type: 'error',
          className: 'okta-verify-uv-callout-content',
          title: loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.title', 'login'),
          subtitle: loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.description', 'login'),
          bullets: bulletPoints,
        };
        this.showMessages(createCallout(options));
        return true;
      }
    },
  },
));

export default Body;
