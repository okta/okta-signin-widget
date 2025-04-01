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

import mockResponse from '../../../../playground/mocks/data/idp/idx/error-okta-verify-uv-totp-verify-enable-biometrics.json';
import { setup } from './util';
import { mockMathRandom } from '../utils/mockMathRandom';

describe('authenticator-verification-ov-totp-biometrics-error', () => {
  beforeEach(() => {
    mockMathRandom();
  });

  it('should render form with Biometrics error', async () => {
    const { container, findAllByRole, findByRole } = await setup({ mockResponse });
    const [alertBoxTitle, pageTitle] = await findAllByRole('heading', { level: 2 });
    await findByRole('alert');
    expect(pageTitle.textContent).toBe('Enter a code');
    expect(alertBoxTitle.textContent).toBe('Enable biometrics in Okta Verify');
    expect(container).toMatchSnapshot();
  });
});
