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

import mockResponse from '@okta/mocks/data/idp/idx/authenticator-enroll-email-emailmagiclink-true.json';
import { createAuthJsPayloadArgs, setup } from './util';

describe('Email authenticator enroll when email magic link = true Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render form', async () => {
    const {
      authClient, container, findByText,
    } = await setup({
      mockResponse,
    });

    // renders the form
    await findByText(/Verify with your email/);
    expect(container).toMatchSnapshot();

    // running polling
    jest.advanceTimersByTime(5000 /* refresh: 4000 */);
    await findByText(/Verify with your email/);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs(
        'POST',
        'idp/idx/challenge/poll',
        undefined,
        'application/ion+json; okta-version=1.0.0',
      ),
    );
  });
});
