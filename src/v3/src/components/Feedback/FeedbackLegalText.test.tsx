/*
 * Copyright (c) 2025-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { render } from '@testing-library/preact';
import { h } from 'preact';

import mockLoginStrings from '../../../../../packages/@okta/i18n/src/json/login.json';
import { OKTA_MASTER_SUBSCRIPTION_AGREEMENT_URL, OKTA_PRIVACY_POLICY_URL } from './constants';
import { FeedbackLegalText } from './FeedbackLegalText';

// The real English `feedback.legal` string, so a token renumbering in
// login.properties that the renderer doesn't follow fails here.
jest.mock('../../util', () => ({
  loc: (key: string) => (mockLoginStrings as Record<string, string>)[key],
}));

describe('FeedbackLegalText', () => {
  it('renders <$1> as the emphasized button name and <$2>/<$3> as the legal links', () => {
    const { container, getByText } = render(<FeedbackLegalText i18nKey="feedback.legal" />);

    expect(getByText('Send feedback').tagName).toBe('STRONG');
    expect(getByText('Okta Privacy Policy').closest('a'))
      .toHaveAttribute('href', OKTA_PRIVACY_POLICY_URL);
    expect(getByText('Master Subscription Agreement').closest('a'))
      .toHaveAttribute('href', OKTA_MASTER_SUBSCRIPTION_AGREEMENT_URL);
    // every token was consumed: no raw markup left for the user to see
    expect(container.textContent).not.toMatch(/<\/?\$\d>/);
    expect(container.textContent).toBe(
      'By clicking Send feedback, you voluntarily allow Okta to process personal information to '
      + 'improve our services under the Okta Privacy Policy and Master Subscription Agreement.',
    );
  });
});
