import { $ } from 'okta';
import { BaseFormWithPolling } from '../internals';
import Logger from 'util/Logger';
import {
  AUTHENTICATOR_CANCEL_ACTION,
  AUTHENTICATION_CANCEL_REASONS,
  CHALLENGE_TIMEOUT,
} from '../utils/Constants';
import BrowserFeatures from 'util/BrowserFeatures';
import { doChallenge, cancelPollingWithParams } from '../utils/ChallengeViewUtil';

const request = (opts) => {
  const ajaxOptions = Object.assign({
    method: 'GET',
    contentType: 'application/json',
  }, opts);
  return $.ajax(ajaxOptions);
};

const Body = BaseFormWithPolling.extend({
  noButtonBar: true,

  className: 'ion-form device-challenge-poll',

  events: {
    'click #launch-ov': function(e) {
      e.preventDefault();
      this.doCustomURI();
    }
  },

  pollingCancelAction: AUTHENTICATOR_CANCEL_ACTION,

  initialize() {
    BaseFormWithPolling.prototype.initialize.apply(this, arguments);
    this.listenTo(this.model, 'error', this.onPollingFail);
    this.doChallenge();
    this.startPolling();
  },

  doChallenge() {
    doChallenge(this);
  },

  onPollingFail() {
    this.$('.spinner').hide();
    this.stopPolling();
  },

  remove() {
    BaseFormWithPolling.prototype.remove.apply(this, arguments);
    this.stopProbing();
    this.stopPolling();
  },

  getDeviceChallengePayload() {
    throw new Error('getDeviceChallengePayload needs to be implemented');
  },

  doLoopback(deviceChallenge) {
    let authenticatorDomainUrl = deviceChallenge.domain !== undefined ? deviceChallenge.domain : '';
    let ports = deviceChallenge.ports !== undefined ? deviceChallenge.ports : [];
    let challengeRequest = deviceChallenge.challengeRequest !== undefined ? deviceChallenge.challengeRequest : '';
    let probeTimeoutMillis = deviceChallenge.probeTimeoutMillis !== undefined ?
      deviceChallenge.probeTimeoutMillis : 100;
    let currentPort;
    let foundPort = false;
    let ovFailed = false;
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

    const doProbing = () => {
      return checkPort()
        .done(() => {
          return onPortFound()
            .done(() => {
              foundPort = true;
              // once the OV challenge succeeds,
              // triggers another polling right away without waiting for the next ongoing polling to be triggered
              // to make the authentication flow goes faster 
              return this.trigger('save', this.model);
            })
            .fail((xhr) => {
              countFailedPorts++;
              // Windows and MacOS return status code 503 when 
              // there are multiple profiles on the device and
              // the wrong OS profile responds to the challenge request
              if (xhr.status !== 503) {
                // when challenge responds with other errors,
                // - stop the remaining probing
                ovFailed = true;
                // - cancel polling right away
                cancelPollingWithParams(
                  this.options.appState,
                  this.pollingCancelAction,
                  AUTHENTICATION_CANCEL_REASONS.OV_ERROR,
                  xhr.status
                );
              } else if (countFailedPorts === ports.length) {
                // when challenge is responded by the wrong OS profile and
                // all the ports are exhausted,
                // cancel the polling like the probing has failed
                cancelPollingWithParams(
                  this.options.appState,
                  this.pollingCancelAction,
                  AUTHENTICATION_CANCEL_REASONS.LOOPBACK_FAILURE,
                  null
                );
              }
            });
        })
        .fail(onFailure);
    };

    let probeChain = Promise.resolve();
    ports.forEach(port => {
      probeChain = probeChain
        .then(() => {
          if (!(foundPort || ovFailed)) {
            currentPort = port;
            return doProbing();
          }
        })
        .catch(() => {
          countFailedPorts++;
          Logger.error(`Authenticator is not listening on port ${currentPort}.`);
          if (countFailedPorts === ports.length) {
            Logger.error('No available ports. Loopback server failed and polling is cancelled.');
            cancelPollingWithParams(
              this.options.appState,
              this.pollingCancelAction,
              AUTHENTICATION_CANCEL_REASONS.LOOPBACK_FAILURE,
              null
            );
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

  stopProbing() {
    this.checkPortXhr && this.checkPortXhr.abort();
    this.probingXhr && this.probingXhr.abort();
  },
});

export default Body;
