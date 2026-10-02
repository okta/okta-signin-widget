/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { IdxActionParams } from '@okta/okta-auth-js';
import { FunctionComponent } from 'preact';
import { useEffect } from 'preact/hooks';

import { ChromeLNADeniedError } from '../../../../util/Errors';
import Logger from '../../../../util/Logger';
import { useWidgetContext } from '../../contexts';
import { ActionParams, LoopbackProbeElement } from '../../types';
import {
  getChromeLNAPermissionState, isAndroid, isPollingStep, isTimeoutError, makeRequest,
} from '../../util';

// Granular loopback cancel reasons (OKTA-1288279). Reported on the /cancel
// request so the backend/Splunk can tell a probe timeout, a challenge timeout, a
// wrong-OS-profile 503, and LNA-denied apart from the opaque network failure.
type LoopbackCancelReason =
  | 'OV_UNREACHABLE_BY_LOOPBACK'
  | 'OV_LOOPBACK_PROBE_TIMEOUT'
  | 'OV_LOOPBACK_CHALLENGE_TIMEOUT'
  | 'OV_LOOPBACK_WRONG_PROFILE'
  | 'OV_UNREACHABLE_BY_LOOPBACK_LNA';

// Priority of the reasons that can be observed while probing ports. When ports
// fail differently we report the single highest-priority one, once, after all
// ports are exhausted. LNA outranks all of these but is determined separately by
// the post-probe permission check, so it is not part of this map.
const PROBE_FAILURE_PRIORITY: Record<LoopbackCancelReason, number> = {
  OV_UNREACHABLE_BY_LOOPBACK: 0,
  OV_LOOPBACK_PROBE_TIMEOUT: 1,
  OV_LOOPBACK_WRONG_PROFILE: 2,
  OV_LOOPBACK_CHALLENGE_TIMEOUT: 3,
  OV_UNREACHABLE_BY_LOOPBACK_LNA: 4,
};

const LoopbackProbe: FunctionComponent<{ uischema: LoopbackProbeElement }> = ({
  uischema: {
    options: {
      deviceChallengePayload,
      cancelStep,
      step,
      isRegisteredConditionSilentProbe,
    },
  },
}) => {
  const widgetContext = useWidgetContext();
  const {
    authClient, idxTransaction, setIdxTransaction, widgetProps, pollInFlightRef,
    setChromeLNADenied,
  } = widgetContext;
  const disableConcurrentPolling = widgetProps?.features?.disableConcurrentPolling;
  const disablePollDuringCancel = widgetProps?.features?.disablePollDuringCancel;

  const probeTimeoutMillis: number = typeof deviceChallengePayload.probeTimeoutMillis === 'undefined'
    ? 100 : deviceChallengePayload.probeTimeoutMillis;
  const ports: string[] = deviceChallengePayload.ports || [];
  const {
    domain,
    httpsDomain,
    challengeRequest,
    chromeLocalNetworkAccessDetails,
    granularLoopbackFailureReasonsEnabled,
  } = deviceChallengePayload;
  // WebView2 iframe enhancement (OKTA-1135857): treat the enhancement as enabled
  // unless the flag is explicitly false, so behavior is preserved if the backend
  // later removes the field from the response.
  const isWebView2EnhancementEnabled = !!chromeLocalNetworkAccessDetails
    && chromeLocalNetworkAccessDetails.iframeRenderedInWebView2ContextEnhancementEnabled !== false;
  // Granular loopback cancel reasons (OKTA-1288279) are opt-in: only report them
  // when the backend explicitly turns the gate on, otherwise collapse to the
  // single OV_UNREACHABLE_BY_LOOPBACK bucket older cancel-request enums accept.
  const granularReasonsEnabled = granularLoopbackFailureReasonsEnabled === true;

  const submitHandler = async (stepName: string) => {
    const payload: IdxActionParams = {
      step: stepName,
    };
    if (typeof idxTransaction?.context.stateHandle !== 'undefined') {
      payload.stateHandle = idxTransaction.context.stateHandle;
    }

    // When FF is on and another poll-step `proceed` is in flight (e.g.
    // usePolling's setTimeout already fired), or a /cancel from
    // cancelHandler is in flight, suppress this one. cancelHandler itself
    // is intentionally NOT guarded — cancel must always go through.
    const guarded = (disableConcurrentPolling || disablePollDuringCancel)
      && isPollingStep(stepName);
    if (guarded && pollInFlightRef?.current) {
      return;
    }
    if (guarded && pollInFlightRef) {
      pollInFlightRef.current = true;
    }
    try {
      const newTransaction = await authClient?.idx.proceed(payload);
      setIdxTransaction(newTransaction);
    } finally {
      if (guarded && pollInFlightRef) {
        pollInFlightRef.current = false;
      }
    }
  };

  const cancelHandler = async (params?: ActionParams) => {
    const payload: IdxActionParams = {
      actions: [{
        name: cancelStep,
        params,
      }],
    };
    if (typeof idxTransaction?.context.stateHandle !== 'undefined') {
      payload.stateHandle = idxTransaction.context.stateHandle;
    }
    // When FF is on, claim the shared pollInFlightRef so any racing
    // poll-step `proceed` (from usePolling's timer or submitHandler)
    // is suppressed at the existing guard in usePolling.ts.
    // "Claim only if free, clear only what you claimed" — if a /poll
    // is already in flight, the flag is already true; we don't touch
    // it, and its own `finally` will clear it.
    const claimedPollFlag = !!(disablePollDuringCancel
      && pollInFlightRef && !pollInFlightRef.current);
    if (claimedPollFlag && pollInFlightRef) {
      pollInFlightRef.current = true;
    }
    try {
      const newTransaction = await authClient?.idx.proceed(payload);
      setIdxTransaction(newTransaction);
    } finally {
      if (claimedPollFlag && pollInFlightRef) {
        pollInFlightRef.current = false;
      }
    }
  };

  /* eslint-disable no-await-in-loop, no-continue */
  useEffect(() => {
    const doLoopback = async () => {
      let foundPort = false;
      // Highest-priority failure reason observed across all ports. Starts at the
      // opaque network failure and is only ever upgraded (never downgraded), so
      // when ports fail differently we report the most informative one, once,
      // after all ports are exhausted. See PROBE_FAILURE_PRIORITY.
      let probeFailureReason: LoopbackCancelReason = 'OV_UNREACHABLE_BY_LOOPBACK';
      const recordFailureReason = (reason: LoopbackCancelReason) => {
        if (PROBE_FAILURE_PRIORITY[reason] > PROBE_FAILURE_PRIORITY[probeFailureReason]) {
          probeFailureReason = reason;
        }
      };
      // Collapse granular reasons to the single bucket when the backend has not
      // opted in, so older backends keep receiving a value their cancel-request
      // enum accepts (OKTA-1288279).
      const toCancelReason = (reason: LoopbackCancelReason): LoopbackCancelReason => (
        granularReasonsEnabled ? reason : 'OV_UNREACHABLE_BY_LOOPBACK'
      );

      let baseUrls = ports.map((port) => `${domain}:${port}`);
      if (httpsDomain) {
        Logger.info('httpsDomain enabled, will probe and challenge https first');
        const httpsBaseUrls = ports.map((port) => `${httpsDomain}:${port}`);
        baseUrls = [...httpsBaseUrls, ...baseUrls];
      }

      // loop over each domain:port
      // eslint-disable-next-line no-restricted-syntax
      for (const baseUrl of baseUrls) {
        // probe the url
        let probeResponse;
        try {
          probeResponse = await makeRequest({
            method: 'GET',
            /*
            OKTA-278573 in loopback server, SSL handshake sometimes takes more than 100ms and thus needs additional
            timeout however, increasing timeout is a temporary solution since user will need to wait much longer in
            worst case.
            TODO: Android timeout is temporarily set to 3000ms and needs optimization post-Beta.
            OKTA-365427 introduces probeTimeoutMillis; but we should also consider probeTimeoutMillisHTTPS for
            customizing timeouts in the more costly Android and other (keyless) HTTPS scenarios.
            */
            timeout: isAndroid() ? 3_000 : probeTimeoutMillis,
            url: `${baseUrl}/probe`,
          });
        } catch (e) {
          // A probe timeout is the dominant failure (security software / dev
          // tools slowing the localhost probe past probeTimeoutMillis) and
          // throws an AbortError; anything else is an unexpected network error.
          // We do not cancel early on a timeout — keep trying the other ports.
          if (isTimeoutError(e)) {
            Logger.error(`Probe request timed out for url ${baseUrl}.`);
            recordFailureReason('OV_LOOPBACK_PROBE_TIMEOUT');
          } else {
            Logger.error(`Something unexpected happened while we were checking url ${baseUrl}`);
          }
          // there's more ports to try, continue with next port
          continue;
        }

        if (!probeResponse.ok) {
          Logger.error(`Authenticator is not listening on url ${baseUrl}.`);
          // there's more ports to try, continue with next port
          continue;
        }

        // try port with challenge request
        let challengeResponse;
        try {
          challengeResponse = await makeRequest({
            url: `${baseUrl}/challenge`,
            method: 'POST',
            timeout: 300_000,
            data: JSON.stringify({ challengeRequest }),
          });
        } catch (e) {
          // A challenge timeout is distinct from OV_RETURNED_ERROR (an OV error
          // *status*, handled below). As with probe timeouts we continue to the
          // next port rather than cancelling early.
          if (isTimeoutError(e)) {
            Logger.error(`Challenge request timed out for url ${baseUrl}.`);
            recordFailureReason('OV_LOOPBACK_CHALLENGE_TIMEOUT');
          } else {
            Logger.error(`Something unexpected happened while we were challenging url ${baseUrl}`);
          }
          continue;
        }

        if (!challengeResponse.ok) {
          // Windows and MacOS return status code 503 when
          // there are multiple profiles on the device and
          // the wrong OS profile responds to the challenge request
          if (challengeResponse.status !== 503) {
            // when challenge response with other error statuses, cancel polling
            // and return immediately. OV_RETURNED_ERROR is an existing reason
            // the backend already accepts, so it is not gated.
            cancelHandler({
              reason: 'OV_RETURNED_ERROR',
              statusCode: challengeResponse.status,
            });

            return;
          }
          // Wrong OS profile responded. This branch used to be skipped silently;
          // record it (so it surfaces in telemetry) and continue with the next
          // port.
          Logger.error(`Wrong OS profile responded with 503 on url ${baseUrl}.`);
          recordFailureReason('OV_LOOPBACK_WRONG_PROFILE');
          continue;
        }
        // challenge response was a 2xx, end probing
        foundPort = true;
        break;
      }

      if (foundPort) {
        // success condition
        // once the OV challenge succeeds, triggers another polling right away without waiting
        // for the next ongoing polling to be triggered to make the authentication flow go faster
        submitHandler(step);
        return;
      }

      // no more ports to probe
      Logger.error('No available ports. Loopback server failed and polling is cancelled.');

      // WebView2 iframe enhancement (OKTA-1135857): with the enhancement on,
      // we probe first and only now (after failure) re-check the LNA
      // permission. If it is denied for an interactive flow, surface the LNA
      // remediation instead of cancelling. Silent probes never remediate, and
      // any other permission state falls through to the normal cancel.
      if (isWebView2EnhancementEnabled) {
        await getChromeLNAPermissionState((currPermissionState) => {
          if (currPermissionState === 'denied' && !isRegisteredConditionSilentProbe) {
            // Flip the shared signal so the transformer re-runs and renders
            // the LNA remediation callout in place of this probe.
            setChromeLNADenied(true);
            // Rethrown by getChromeLNAPermissionState -> unhandled rejection,
            // captured by Sentry for monitoring (same path as the FF-off flow).
            throw new ChromeLNADeniedError('Chrome Local Network Access permission was denied for FastPass.');
          }
          // Permission denied on a silent probe (which cannot remediate) — report
          // the LNA reason, which outranks any port-level failure. Otherwise fall
          // back to the highest-priority reason seen while probing.
          const reason: LoopbackCancelReason = currPermissionState === 'denied'
            ? 'OV_UNREACHABLE_BY_LOOPBACK_LNA'
            : probeFailureReason;
          cancelHandler({
            reason: toCancelReason(reason),
            statusCode: null,
          });
        });
        return;
      }

      // cancel polling and return
      cancelHandler({
        reason: toCancelReason(probeFailureReason),
        statusCode: null,
      });
    };

    doLoopback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeRequest]);
  /* eslint-enable no-await-in-loop, no-continue */

  return null;
};

export default LoopbackProbe;
