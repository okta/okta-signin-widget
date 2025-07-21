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

import mockResponse from '../../src/mocks/response/idp/idx/introspect/oda-enrollment-android-applink.json';

describe('oda-enrollment-android-applink', () => {
  it('should render form', async () => {
    const { container, findByRole } = await setup({ mockResponse });
    const heading = await findByRole('heading', { level: 1 });

    expect(heading.textContent).toBe('Additional setup required to use Okta FastPass');
    expect(container).toMatchSnapshot();
  });

  it('should render view when "No, I don’t have an account" is selected', async () => {
    const { container, user, findByRole } = await setup({ mockResponse });
    const heading = await findByRole('heading', { level: 1 });

    expect(heading.textContent).toBe('Additional setup required to use Okta FastPass');

    const nextBtn = await findByRole('button', { name: 'Next' });
    await user.click(nextBtn);

    const newHeading = await findByRole('heading', { level: 1 });
    expect(newHeading.textContent).toBe('Set up an Okta Verify account');
    expect(container).toMatchSnapshot();
  });

  it('should render view when "Yes, I already have an account" is selected', async () => {
    const {
      container, user, findByRole, findByText,
    } = await setup({ mockResponse });
    const heading = await findByRole('heading', { level: 1 });

    expect(heading.textContent).toBe('Additional setup required to use Okta FastPass');

    const radioOpt = await findByText('Yes, I already have an account');
    const nextBtn = await findByRole('button', { name: 'Next' });
    await user.click(radioOpt);
    await user.click(nextBtn);

    await findByText('Okta FastPass is a security method that can sign you in without needing your username.');
    expect(container).toMatchSnapshot();
  });
});
