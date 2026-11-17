/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { fireEvent } from '@testing-library/preact';

import mockResponse from '../../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator-phishing-resistant.json';
import { setup } from './util';

describe('authenticator-verification-select-authenticator-phishing-resistant', () => {
  it('translates the authenticator labels listed under "More options"', async () => {
    const { container, findByRole, findByText } = await setup({ mockResponse });
    await findByRole('heading', { level: 1 });
    const list = container.querySelector('[data-se="authenticator-verify-list"]') as HTMLElement;
    expect(list.textContent).toContain('Security Key or Biometric Authenticator');

    const toggle = (await findByText('More options')).closest('[aria-expanded]') as HTMLElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    const moreList = container.querySelector('[data-se="authenticator-verify-more-options-list"]') as HTMLElement;
    expect(moreList.textContent).toContain('Email Authentication');
    expect(moreList.textContent).toContain('Security Question');
    expect(moreList.textContent).not.toContain('Okta Email');
    expect(moreList.textContent).not.toContain('Okta Security Question');
  });
});
