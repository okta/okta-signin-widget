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

import { FunctionComponent, h } from 'preact';
import { useEffect } from 'preact/hooks';
import Logger from 'util/Logger';
import { useWidgetContext } from '../../contexts';
import { useOnSubmit } from '../../hooks';
import { LoopbackProbeElement } from '../../types';
import { isAndroid } from '../../util';

type RequestOptions = {
  url: string;
  timeout: number;
  method: 'GET' | 'POST';
  data?: string;
}

/**
 * Temporary request client to be removed once this functionality is added
 * to auth-js library.
 * @see https://oktainc.atlassian.net/browse/OKTA-561852
 * @returns Promise<Response>
 */
const makeRequest = async ({ url, timeout, method, data }: RequestOptions) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(url, {
    method,
    ...(typeof data === 'string' ? { body: data } : {}),
    signal: controller.signal,
  });

  clearTimeout(id);

  return response;
}

const LoopbackProbe: FunctionComponent<{ uischema: LoopbackProbeElement }> = () => {
  const onSubmitHandler = useOnSubmit();
  const context = useWidgetContext();
  const { idxTransaction } = context;
  const relatesTo = idxTransaction?.nextStep?.relatesTo;

  // @ts-expect-error probeTimeoutMillis is not on IdxAuthenticator
  const probeTimeoutMillis: number = typeof relatesTo?.value.probeTimeoutMillis === 'undefined' ?
    // @ts-expect-error probeTimeoutMillis is not on IdxAuthenticator
    100 : relatesTo?.value.probeTimeoutMillis;
  // @ts-expect-error ports is not on IdxAuthenticator
  const ports: number[] = relatesTo?.value.ports || [];
  // @ts-expect-error domain is not on IdxAuthenticator
  const domain: string = relatesTo?.value.domain;
  // @ts-expect-error challengeRequest is not on IdxAuthenticator
  const challengeRequest: string = relatesTo?.value.challengeRequest;

  const cancelStep = idxTransaction?.availableSteps?.find(({ name }) => name === 'authenticatorChallenge-cancel');
  const cancelHandler = (params?: Record<string, unknown> | undefined) => {
    if (typeof cancelStep !== 'undefined') {
      onSubmitHandler({
        isActionStep: true,
        step: cancelStep?.name,
        params,
      });
    }
  };

  useEffect(() => {
    const doLoopback = async () => {
      // loop over each port
      ports.every(async (port, index) => {
        try {
          // probe the port
          const probeResponse = await makeRequest({
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
            url: `${domain}:${port}/probe`,
          });

          if (!probeResponse.ok) {
            Logger.error(`Authenticator is not listening on port ${port}.`);

            if (index + 1 === ports.length) {
              // if this was the last port: cancel polling and return
              Logger.error('No available ports. Loopback server failed and polling is cancelled.');

              cancelHandler({
                reason: 'OV_UNREACHABLE_BY_LOOPBACK',
                statusCode: null,
              });

              return false;
            }
            // there's more ports to try, continue with next port
            return true;
          }

          // try port with challenge request
          const challengeResponse = await makeRequest({
            url: `${domain}:${port}/challenge`,
            method: 'POST',
            timeout: 300_000,
            data: JSON.stringify({ challengeRequest }),
          });

          if (!challengeResponse.ok) {
            // Windows and MacOS return status code 503 when 
            // there are multiple profiles on the device and
            // the wrong OS profile responds to the challenge request
            if (challengeResponse.status !== 503) {
              // when challenge response with other error statuses,
              // cancel polling and return
              cancelHandler({
                reason: 'OV_RETURNED_ERROR',
                statusCode: challengeResponse.status,
              });

              return false;
            } else if (index + 1 === ports.length) {
              // if this was last port: cancel polling and return
              cancelHandler({
                reason: 'OV_UNREACHABLE_BY_LOOPBACK',
                statusCode: null,
              });

              return false;
            }
            // no errors but this is not the port we're looking for
            // continue with next loop iteration
            return true;
          }
        } catch (e) {
          // only for unexpected error conditions (e.g. fetch throws an error)
          Logger.error(`Something unexpected happened while we were checking port ${port}`);

          return false;
        }
      });

      // success condition
      // once the OV challenge succeeds, triggers another polling right away without waiting
      // for the next ongoing polling to be triggered to make the authentication flow go faster 
      onSubmitHandler({
        step: 'device-challenge-poll',
      });
    };

    doLoopback();
  }, []);

  return null;
};

export default LoopbackProbe;
