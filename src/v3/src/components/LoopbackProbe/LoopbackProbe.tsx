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
import { useWidgetContext } from '../../contexts';
import { useOnSubmit } from '../../hooks';
import { LoopbackProbeElement } from '../../types';

type RequestOptions = {
  url: string;
  method?: 'GET' | 'POST';
  data?: string;
}

// add timeout option: https://dmitripavlutin.com/timeout-fetch-request/
const makeRequest = async ({ url, method = 'GET', data }: RequestOptions) => {
  console.warn(`[LoopbackProbe#makeRequest]: Making a ${method} request to ${url}`);
  try {
    const response = await fetch(url, {
      method,
      ...(typeof data === 'string' ? { body: data } : {}),
    });

    return response;
  } catch (e) {
    throw new Error(`Failed to make a request to ${url}.`);
  }
}

const LoopbackProbe: FunctionComponent<{ uischema: LoopbackProbeElement }> = ({ uischema }) => {
  const {
    options: {
      ports,
      domain,
      challengeRequest,
    },
  } = uischema;
  const onSubmitHandler = useOnSubmit();
  const context = useWidgetContext();
  const { idxTransaction } = context;
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
    (async () => {
      // get the ports list
      // loop over each port and do:
      ports.every(async (port, index) => {
        try {
      //  1. probe the port
          const probeResponse = await makeRequest({
            url: `${domain}:${port}/probe`,
          });

          if (!probeResponse.ok) {
        //    on fail: return and call onFailure
            console.error(`Authenticator is not listening on port ${port}.`);

            if (index + 1 === ports.length) {
        //    if this was the last port: return and cancel polling, OV_UNREACHABLE_BY_LOOPBACK
              // TODO: use Logger.error
              console.error('No available ports. Loopback server failed and polling is cancelled.');

              cancelHandler({
                reason: 'OV_UNREACHABLE_BY_LOOPBACK',
                statusCode: null,
              });

              return false;
            }
        //    if it wasn't the last port: return and continue with next port
            return true;
          }

      //  2. check port for challenge
          const challengeResponse = await makeRequest({
            url: `${domain}:${port}/challenge`,
            method: 'POST',
            // todo get actual challengeRequest value
            data: JSON.stringify({ challengeRequest }),
          });

      //    on fail:
          if (!challengeResponse.ok) {
        //    if status !== 503: return and cancel polling, OV_RETURNED_ERROR
            // Windows and MacOS return status code 503 when 
            // there are multiple profiles on the device and
            // the wrong OS profile responds to the challenge request
            if (challengeResponse.status !== 503) {
              cancelHandler({
                reason: 'OV_RETURNED_ERROR',
                statusCode: challengeResponse.status,
              });

              // when challenge responds with other errors abort port probing
              return false;
            } else if (index + 1 === ports.length) {
        //    else if this was last port: return and cancel polling, OV_UNREACHABLE_BY_LOOPBACK
              cancelHandler({
                reason: 'OV_UNREACHABLE_BY_LOOPBACK',
                statusCode: null,
              });

              return false;
            }
        //    else: continue with next loop iteration
            return true;
          }
        } catch (e) {
          // only for unexpected error conditions (e.g. fetch throws an error)
          // TODO: use Logger.error
          console.error(`Something unexpected happened while we were checking port ${port}`);

          return false;
        }
      });

      //  3. trigger submit action
      // once the OV challenge succeeds, triggers another polling right away without waiting
      // for the next ongoing polling to be triggered to make the authentication flow go faster 
      onSubmitHandler({
        step: 'device-challenge-poll',
      });
    })();
  }, []);

  return null;
};

export default LoopbackProbe;
