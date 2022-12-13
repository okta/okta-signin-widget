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

import { createAuthJsPayloadArgs, setup } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/challenge/verify-ov-push-manual.json';

describe('authenticator-verification-okta-verify-push-code', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Push notification sent/);
    await findByText(/Send push automatically/);
    await findByText(/On your mobile device, open the Okta Verify prompt, then tap 52 in Okta Verify to continue./);
    expect(container).toMatchSnapshot();
  });

  describe('Polling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useFakeTimers();
    });

    it('should make poll request after expected delay', async () => {
      const { findByText, authClient } = await setup({ mockResponse });
      await findByText(/Push notification sent/);
      await findByText(/Send push automatically/);
      await findByText(/On your mobile device, open the Okta Verify prompt, then tap 52 in Okta Verify to continue./);

      jest.advanceTimersByTime(1500 /* refresh: 1000 */);

      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/authenticators/poll'),
      );
    });
  });
});
