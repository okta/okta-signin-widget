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

import mockResponse from '../../src/mocks/response/oauth2/default/v1/interact/error-activation-token-invalid.json';

describe('error-activation-token-invalid', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    // error title
    await findByText(/Activation link no longer valid/);
    // error description
    await findByText(/This can happen if you have already activated your account, or if the URL you are trying to use is invalid. Contact your administrator for further assistance./);
    expect(container).toMatchSnapshot();
  });
});
