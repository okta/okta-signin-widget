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

const checkPort = async (domain: string, port: number): Promise<number> => {
  try {
    // deviceChallenge.domain is where the baseUrl should come from
    const response = await makeRequest({
      url: `${domain}:${port}/probe`,
    });

    if (!response.ok) {
      throw new Error();
    }
  } catch (e) {
    // TODO: use Logger.error
    console.warn(`Something unexpected happened while we were checking port ${port}`);
    throw e;
  }

  return port;
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
    const doProbing = async () => {
      const promises = ports.map((portNumber) => {
        return checkPort(domain, portNumber);
      });

      try {
        // @ts-expect-error TODO see if we can update to es2021
        const successPort = await Promise.any(promises);
        console.warn('success!', successPort);
        return successPort;
      } catch (e) {
        // TODO; use Logger.error
        console.warn('No available ports. Loopback server failed and polling is cancelled');
        // call cancel polling method
        cancelHandler({
          reason: 'OV_UNREACHABLE_BY_LOOPBACK',
          statusCode: null,
        });

        // // @ts-expect-error es2021 issue
        // if (e instanceof AggregateError) {
        //   // @ts-expect-error es2021 issue
        //   console.warn(e.errors);
        // }
      }
    };

    const onPortFound = async (port: number) => {
      const response = await makeRequest({
        url: `${domain}:${port}/challenge`,
        method: 'POST',
        // todo get actual challengeRequest value
        data: JSON.stringify({ challengeRequest }),
      });
      if (!response.ok) {
        if (response.status !== 503) {
          // Windows and MacOS return status code 503 when 
          // there are multiple profiles on the device and
          // the wrong OS profile responds to the challenge request
          cancelHandler({
            reason: 'OV_RETURNED_ERROR',
            statusCode: response.status,
          });
        }
      }
    };
    const main = async () => {
      const loopbackServerPort = await doProbing();

      if (loopbackServerPort) {
        await onPortFound(loopbackServerPort);
        // trigger another poll
        onSubmitHandler({
          step: 'device-challenge-poll',
        });
      }
    };

    main();
  }, []);

  return null;
};

export default LoopbackProbe;
