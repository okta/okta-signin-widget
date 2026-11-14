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

import { IdxAuthenticator } from '@okta/okta-auth-js';
import { AuthenticatorButtonElement } from 'src/types';

import { markPhishingResistantButtons } from './phishingResistant';

const authenticators = [{
  id: 'autWebauthn',
  methods: [{ type: 'webauthn', phishingResistantCapable: true }],
}] as unknown as IdxAuthenticator[];

const button = (
  actionParams?: Record<string, string>,
  authenticator?: Partial<IdxAuthenticator>,
) => ({
  type: 'AuthenticatorButton',
  options: { actionParams, authenticator },
} as unknown as AuthenticatorButtonElement);

describe('markPhishingResistantButtons', () => {
  it('flags a button by its authenticator id', () => {
    const [result] = markPhishingResistantButtons(
      [button({ 'authenticator.id': 'autWebauthn' })],
      authenticators,
    );
    expect(result.options.phishingResistant).toBe(true);
  });

  it('does not flag a button without an authenticator id, even if relatesTo.id matches', () => {
    // relatesTo.id is an enrollment id, so it must never be used for the join
    const [result] = markPhishingResistantButtons(
      [button(undefined, { id: 'autWebauthn' } as IdxAuthenticator)],
      authenticators,
    );
    expect(result.options.phishingResistant).toBeUndefined();
  });

  it('returns buttons untouched when the backend sent no flag', () => {
    const buttons = [button({ 'authenticator.id': 'autWebauthn' })];
    const noFlag = [{ id: 'autWebauthn', methods: [{ type: 'webauthn' }] }] as unknown as IdxAuthenticator[];
    expect(markPhishingResistantButtons(buttons, noFlag)).toBe(buttons);
  });
});
