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

import mockResponse from '../../src/mocks/response/idp/idx/challenge/answer/authenticator-enroll-password-requirements-not-met.json';

describe('authenticator-password-requirements-not-met', () => {
  it('should render form', async () => {
    const { container, findByRole, findByLabelText } = await setup({ mockResponse });
    const heading = await findByRole('heading', { level: 2 });
    const enterPasswordEle = await findByLabelText('Enter password') as HTMLInputElement;

    expect(heading.textContent).toBe('Set up password');
    expect(enterPasswordEle).toHaveErrorMessage(/Password requirements were not met/);
    expect(container).toMatchSnapshot();
  });
});
