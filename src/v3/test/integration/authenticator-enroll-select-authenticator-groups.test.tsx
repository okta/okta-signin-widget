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

import { setup } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/authenticator-enroll-select-authenticator-groups.json';

// End-to-end smoke test for the N-of-M grouped enrollment page. The remaining
// scenarios (two-groups, optional-phase, both grace-period flavors) are covered
// by unit tests in src/v3/src/transformer/selectAuthenticator/utils.test.ts and
// AuthenticatorGroupCard.test.tsx. Every setup() in this file starts a fresh
// okta-auth-js flow which persists internal state across `it`s in the same
// describe; grouping multiple scenarios in one file wedges later tests on the
// loading spinner. See the plan doc for context.
describe('authenticator-enroll-select-authenticator-groups (N-of-M smoke)', () => {
  it('renders a group card with "Choose 1 of:" label and all three member buttons for a 1-of-3 required group', async () => {
    const { findByTestId, findByText } = await setup({ mockResponse });

    await findByText(/Set up security methods/);
    const card = await findByTestId('authenticator-enroll-group-0');
    expect(card).toBeInTheDocument();
    const label = await findByTestId('authenticator-enroll-group-card-label');
    expect(label.textContent).toBe('Choose 1 of:');
    // The card wraps a normal AuthenticatorButtonList — per-button data-se and
    // interactions are the same as bare-button enrollment, so existing e2e
    // page-object selectors keep working. We assert the two authenticators that
    // render with a single test id at the enroll-selection step; Phone has a
    // downstream methodType selector that gets its own testId later in the flow.
    await findByTestId('okta_email');
    await findByTestId('security_question');
  });
});
