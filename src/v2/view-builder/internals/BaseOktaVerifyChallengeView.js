/* eslint max-statements: [2, 22] */
import { $ } from '@okta/courage';
import BaseFormWithPolling from '../internals/BaseFormWithPolling';
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
  isRegisteredConditionSilentProbe,
  showChromeLNADeniedError,
} from '../utils/ChallengeViewUtil';

const request = (opts) => {
  const ajaxOptions = Object.assign({
    method: 'GET',
    contentType: 'application/json',
  }, opts);
  return $.ajax(ajaxOptions);
};

// Granular loopback cancel reasons (OKTA-1288279). We probe multiple ports and
// continue on each failure; a single reason is sent once, at the end, when all
// ports are exhausted. When ports fail differently we report the highest-priority
// one: LNA > challenge-timeout > wrong-profile > probe-timeout > generic. The
// tracker collapses to the single OV_UNREACHABLE_BY_LOOPBACK bucket unless the
// backend opts in via deviceChallenge.granularLoopbackFailureReasonsEnabled, so
// older cancel-request enums still receive a value they accept. Must stay in sync
// with the gen3 LoopbackCancelReason set in
// src/v3/src/components/LoopbackProbe/LoopbackProbe.tsx.
const createLoopbackReasonTracker = (granularEnabled) => {
  const PRIORITY = {
    [AUTHENTICATION_CANCEL_REASONS.LOOPBACK_FAILURE]: 0,
    [AUTHENTICATION_CANCEL_REASONS.PROBE_TIMEOUT]: 1,
    [AUTHENTICATION_CANCEL_REASONS.WRONG_PROFILE]: 2,
    [AUTHENTICATION_CANCEL_REASONS.CHALLENGE_TIMEOUT]: 3,
    [AUTHENTICATION_CANCEL_REASONS.LOOPBACK_FAILURE_LNA]: 4,
  };
  let current = AUTHENTICATION_CANCEL_REASONS.LOOPBACK_FAILURE;
  return {
    record(reason) {
      if (PRIORITY[reason] > PRIORITY[current]) {
        current = reason;
      }
    },
    resolve() {
      return granularEnabled ? current : AUTHENTICATION_CANCEL_REASONS.LOOPBACK_FAILURE;
    },
  };
};

// A jQuery $.ajax request surfaces a timeout (the dominant loopback failure:
// security software / dev tools slowing the localhost probe past
// probeTimeoutMillis) as status 0 with statusText 'timeout'. Connection refused
// and HTTP error statuses do not, so this cleanly separates a timeout from an
// opaque network failure or an error response.
const isTimeoutXhr = (xhr) => xhr?.status === 0 && xhr?.statusText === 'timeout';

const Body = BaseFormWithPolling.extend({
  noButtonBar: true,

  className: 'ion-form device-challenge-poll',

  removed: false,

  events: {
    'click #launch-ov': function(e) {
      e.preventDefault();
      this.doCustomURI();
    }
  },

  pollingCancelAction: AUTHENTICATOR_CANCEL_ACTION,

  initialize() {
    BaseFormWithPolling.prototype.initialize.apply(this, arguments);
    this.removed = false;
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
    this.removed = true;
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
    // See createLoopbackReasonTracker. Gated by the backend opt-in so gate-off
    // behavior (including the reason value) is unchanged. OKTA-1288279.
    const reasonTracker = createLoopbackReasonTracker(
      deviceChallenge.granularLoopbackFailureReasonsEnabled === true
    );

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

    const onFailure = (xhr) => {
      Logger.error(`Something unexpected happened while we were checking port ${currentPort}.`);
      // A probe timeout is the dominant loopback failure (security software /
      // dev tools slowing the localhost probe past probeTimeoutMillis). Record
      // it so it can be reported once at exhaustion; non-timeout probe failures
      // fall through to the generic OV_UNREACHABLE_BY_LOOPBACK bucket.
      if (isTimeoutXhr(xhr)) {
        reasonTracker.record(AUTHENTICATION_CANCEL_REASONS.PROBE_TIMEOUT);
      }
      return $.Deferred().reject();
    };

    const doProbing = (domainUrl) => {
      return checkPort(getAuthenticatorUrl('probe', domainUrl))
        .then(() => {
          return onPortFound(getAuthenticatorUrl('challenge', domainUrl))
            .then(() => {
              foundPort = true;
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
            })
            .catch((xhr) => {
              countFailedPorts++;
              if (isTimeoutXhr(xhr)) {
                // A challenge timeout (status 0) is distinct from OV_RETURNED_ERROR,
                // which is OV responding with an error *status*. Match gen3's
                // long-standing behavior: continue to the next port instead of
                // cancelling early, and report once at exhaustion. This also
                // corrects the old gen2 behavior, which mislabeled a challenge
                // timeout as OV_RETURNED_ERROR (status 0) — gate-off now collapses
                // it to the generic OV_UNREACHABLE_BY_LOOPBACK network-failure
                // bucket, which is the accurate description for a timeout.
                reasonTracker.record(AUTHENTICATION_CANCEL_REASONS.CHALLENGE_TIMEOUT);
                if (countFailedPorts === maxNumberOfPorts) {
                  cancelPollingWithParams(
                    this.options.appState,
                    this.pollingCancelAction,
                    reasonTracker.resolve(),
                    null,
                    !this.removed,
                  );
                }
              } else if (xhr.status !== 503) {
                // when challenge responds with other error statuses,
                // - stop the remaining probing
                ovFailed = true;
                // - cancel polling right away (existing, ungated reason)
                cancelPollingWithParams(
                  this.options.appState,
                  this.pollingCancelAction,
                  AUTHENTICATION_CANCEL_REASONS.OV_ERROR,
                  xhr.status,
                  !this.removed,
                );
              } else {
                // Windows and MacOS return status code 503 when there are
                // multiple profiles on the device and the wrong OS profile
                // responds to the challenge request. Record it (so it surfaces
                // in telemetry) and continue with the next port.
                reasonTracker.record(AUTHENTICATION_CANCEL_REASONS.WRONG_PROFILE);
                if (countFailedPorts === maxNumberOfPorts) {
                  // wrong OS profile on every port and all ports exhausted —
                  // cancel the polling like the probing has failed
                  cancelPollingWithParams(
                    this.options.appState,
                    this.pollingCancelAction,
                    reasonTracker.resolve(),
                    null,
                    !this.removed,
                  );
                }
              }
            });
        })
        .catch(onFailure);
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
            // Reports the highest-priority reason recorded while probing
            // (collapsed to OV_UNREACHABLE_BY_LOOPBACK when the gate is off).
            const cancelLoopback = () => cancelPollingWithParams(
              this.options.appState,
              this.pollingCancelAction,
              reasonTracker.resolve(),
              null,
              !this.removed,
            );
            // WebView2 iframe enhancement (OKTA-1135857): when enabled, probe
            // first and re-check the LNA permission only now, after the probe
            // failed. Treat the enhancement as enabled unless the flag is
            // explicitly false, so behavior is preserved if the backend later
            // removes it.
            const chromeLNADetails = deviceChallenge.chromeLocalNetworkAccessDetails;
            if (chromeLNADetails
              && chromeLNADetails.iframeRenderedInWebView2ContextEnhancementEnabled !== false) {
              BrowserFeatures.getChromeLNAPermissionState((currPermissionState) => {
                if (currPermissionState === 'denied') {
                  if (isRegisteredConditionSilentProbe(this)) {
                    // Silent probes never remediate (OKTA-1135857). Report the
                    // LNA reason (OKTA-1288279) — it outranks any port-level
                    // failure — and cancel. Gate-off collapses it to the bucket.
                    reasonTracker.record(AUTHENTICATION_CANCEL_REASONS.LOOPBACK_FAILURE_LNA);
                    cancelLoopback();
                  } else {
                    // Interactive flow: surface the LNA remediation instead of
                    // cancelling. Clear the loopback spinner first.
                    this.removeChildren();
                    showChromeLNADeniedError(this, deviceChallenge);
                  }
                } else {
                  cancelLoopback();
                }
              });
              return;
            }
            cancelLoopback();
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
