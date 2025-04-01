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
import { mockMathRandom } from '../utils/mockMathRandom';

describe('authenticator-verification-okta-verify-push-code', () => {
  beforeEach(() => {
    mockMathRandom();
  });

  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Push notification sent/);
    await findByText(/Send push automatically/);
    await findByText(/On your mobile device, open the Okta Verify prompt, then tap/);
    expect(container).toMatchSnapshot();
  });

  describe('Polling', () => {
    let mockSystemTime: number;

    beforeEach(() => {
      jest.useFakeTimers();
      // Mock system time for triggering resend email reminder element
      mockSystemTime = 1676068045456;
      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => mockSystemTime);
      // sessionStorage 'get' method is mocked for the ReminderPrompts start timestamp variable
      jest.spyOn(global, 'sessionStorage', 'get').mockReturnValue({
        length: 0,
        clear: () => jest.fn(),
        getItem: () => '1676068045456',
        setItem: () => jest.fn(),
        key: () => null,
        removeItem: () => jest.fn(),
      });
    });

    afterEach(() => {
      jest.useFakeTimers();
    });

    it('should display reminder prompt when waiting on page for >= 30 secs', async () => {
      const { container, findByText } = await setup({ mockResponse });
      await findByText(/Push notification sent/);
      await findByText(/Send push automatically/);
      await findByText(/On your mobile device, open the Okta Verify prompt, then tap/);

      // Advance system time to show reminder element
      mockSystemTime += 31_000;
      jest.advanceTimersByTime(500);
      await findByText(/Haven't received a push notification yet?/);

      expect(container).toMatchSnapshot();
    });

    it('should make poll request after expected delay', async () => {
      const { findByText, authClient } = await setup({ mockResponse });
      await findByText(/Push notification sent/);
      await findByText(/Send push automatically/);
      await findByText(/On your mobile device, open the Okta Verify prompt, then tap/);

      jest.advanceTimersByTime(1500 /* refresh: 5000 */);

      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/authenticators/poll'),
      );
    });
  });
});
