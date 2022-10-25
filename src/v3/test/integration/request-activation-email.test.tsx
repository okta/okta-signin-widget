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

import mockResponse from '@okta/mocks/data/idp/idx/request-activation-email.json';
import { createAuthJsPayloadArgs, setup } from './util';

describe('identify-recovery', () => {
  it('renders form', async () => {
    const { container, findByRole } = await setup({ mockResponse });
    await findByRole('heading', { level: 2 });
    expect(container).toMatchSnapshot();
  });

  it('sends correct payload', async () => {
    const {
      authClient,
      user,
      findByText,
    } = await setup({ mockResponse });

    const submitButton = await findByText('Request activation email', { selector: 'button' });
    await user.click(submitButton);

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/request-activation'),
    );
  });
});
