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

import { setup } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/introspect/default.json';

describe('triggerEmailVerifyCallback with otp flow', () => {
  const otp = 'fake-otp';

  // Currently we only test the terminal error path of this flow. Testing the happy path e2e requires the widget to hit the resume() callback,
  // meaning it must already have transaction meta loaded in the authClient, but the authClient gets reinstantiated on every call to setup().
  // TODO: Write a testcafe test to validate the happy path flow in which triggerEmailVerifyCallback() passes the otp to authClient.idx.proceed()
  it('should create proxy server response and render terminal state when interactionHandle is absent', async () => {
    const { container, findByText } = await setup({ mockResponse, widgetOptions: { otp } });
    await findByText(/Your verification code/);
    await findByText(/Enter the OTP in your original authentication location./);
    expect(container).toMatchSnapshot();
  });
});
