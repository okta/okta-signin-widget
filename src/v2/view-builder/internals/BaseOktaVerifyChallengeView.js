/* eslint max-statements: [2, 22] */
import { $ } from '@okta/courage';
import { BaseFormWithPolling } from '../internals';
import Logger from 'util/Logger';
import {
  AUTHENTICATOR_CANCEL_ACTION,
  AUTHENTICATION_CANCEL_REASONS,
  CHALLENGE_TIMEOUT,
} from '../utils/Constants';
import BrowserFeatures from 'util/BrowserFeatures';
import { 
  doChallenge,
  cancelPollingWithParams,
  createInvisibleIFrame,
} from '../utils/ChallengeViewUtil';

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
    let authenticatorHttpsDomainUrl = deviceChallenge.httpsDomain !== undefined ? deviceChallenge.httpsDomain : '';
    let ports = deviceChallenge.ports !== undefined ? deviceChallenge.ports : [];
    let maxNumberOfPorts = ports.length;
    let challengeRequest = deviceChallenge.challengeRequest !== undefined ? deviceChallenge.challengeRequest : '';
    let probeTimeoutMillis = deviceChallenge.probeTimeoutMillis !== undefined ?
      deviceChallenge.probeTimeoutMillis : 100;
    let currentPort;
    let foundPort = false;
    let ovFailed = false;
    let countFailedPorts = 0;

    const getAuthenticatorUrl = (path, domainUrl) => {
      return `${domainUrl}:${currentPort}/${path}`;
    };

    const checkPort = (url) => {
      return request({
        url: url,
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

    const onPortFound = (url) => {
      return request({
        url: url,
        method: 'POST',
        data: JSON.stringify({ challengeRequest }),
        timeout: CHALLENGE_TIMEOUT // authenticator should respond within 5 min (300000ms) for challenge request
      });
    };

    const onFailure = () => {
      Logger.error(`Something unexpected happened while we were checking port ${currentPort}.`);
    };

    const doProbing = (domainUrl) => {
      return checkPort(getAuthenticatorUrl('probe', domainUrl))
        .done(() => {
          return onPortFound(getAuthenticatorUrl('challenge', domainUrl))
            .done(() => {
              foundPort = true;
              if (deviceChallenge.enhancedPollingEnabled !== false) {
                // this way we can gurantee that
                // 1. the polling is triggered right away (1ms interval)
                // 2. Only one polling queue
                // 3. follwoing polling will continue with refresh interval from previous polling response
                // NOTE: technically, there could still be concurrency issue where when we called stopPolling,
                // there is already a polling triggered and hasn't completed yet
                // but the possibility would be much smaller than previous concurrency issue
                // this is a best effort change
                this.stopPolling();
                this.startPolling(1);
                return;
              }
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
              } else if (countFailedPorts === maxNumberOfPorts) {
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

    const handlePortProbing = (port, baseUrl, checkPortMaxFailure) => {
      probeChain = probeChain
        .then(() => {
          if (!(foundPort || ovFailed)) {
            currentPort = port;
            return doProbing(baseUrl);
          }
        })
        .catch(() => {
          countFailedPorts++;
          Logger.error(`Authenticator is not listening on port ${currentPort}.`);
          if (checkPortMaxFailure && countFailedPorts === maxNumberOfPorts) {
            Logger.error('No available ports. Loopback server failed and polling is cancelled.');
            // When no port is found, cancel the polling as well
            // This is to avoid concurrency issue where /poll/cancel takes long time to complete
            // and SIW will receive 400 error if the polling continues
            this.stopPolling();
            cancelPollingWithParams(
              this.options.appState,
              this.pollingCancelAction,
              AUTHENTICATION_CANCEL_REASONS.LOOPBACK_FAILURE,
              null
            );
          }
        });
    };

    // If https domain exists, do https domain probe first
    // This only applies to MacOS for now
    if (authenticatorHttpsDomainUrl) {
      // if https domain are included, max number of ports to be probed should be doubled
      Logger.info('httpsDomain enabled, will probe and challenge https first');
      maxNumberOfPorts += maxNumberOfPorts;
      ports.forEach(port => {
        handlePortProbing(port, authenticatorHttpsDomainUrl, false);
      });
    }

    // Always do probe on regular domain
    ports.forEach(port => {
      handlePortProbing(port, authenticatorDomainUrl, true);
    });
  },

  doCustomURI() {
    this.ulDom && this.ulDom.remove();
    const IframeView = createInvisibleIFrame('custom-uri-container', this.customURI);
    this.ulDom = this.add(IframeView).last();
  },

  doChromeDTC(deviceChallenge) {
    this.ulDom && this.ulDom.remove();
    const IframeView = createInvisibleIFrame('chrome-dtc-container', deviceChallenge.href);
    this.ulDom = this.add(IframeView).last();
  },

  stopProbing() {
    this.checkPortXhr && this.checkPortXhr.abort();
    this.probingXhr && this.probingXhr.abort();
  },
});

export default Body;
