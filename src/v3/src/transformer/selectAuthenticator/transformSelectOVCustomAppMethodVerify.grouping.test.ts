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
import { AUTHENTICATOR_KEY, IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  AuthenticatorButtonListElement,
  FieldElement,
  UISchemaElement,
  WidgetProps,
} from 'src/types';

import { transformSelectOVCustomAppMethodVerify } from './transformSelectOVCustomAppMethodVerify';

// Uses the real ./utils (no mock) so grouping is exercised end to end.
describe('Transform Select OV Method Verify grouping (real utils)', () => {
  const AUTHENTICATOR_ID = 'aut13qrZReYpIib7R0g4';
  const widgetProps = {} as unknown as WidgetProps;
  const methodOptions = [
    { label: 'Use Okta FastPass', value: 'signed_nonce' },
    { label: 'Get a push notification', value: 'push' },
    { label: 'Enter a code', value: 'totp' },
  ];

  const run = (
    types: string[],
    flagged: string[],
    withRawAuthenticators = true,
  ): UISchemaElement[] => {
    const transaction = getStubTransactionWithNextStep();
    const formBag = getStubFormBag();
    const options = methodOptions.filter(({ value }) => types.includes(value));
    formBag.uischema.elements = [{
      type: 'Field',
      options: { inputMeta: { name: 'authenticator.methodType', options } },
    } as FieldElement];
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
      inputs: [{
        name: 'authenticator',
        value: [
          {
            name: 'id',
            required: true,
            mutable: false,
            value: AUTHENTICATOR_ID,
          },
          { name: 'methodType', options },
        ],
      }],
      relatesTo: {
        value: { key: AUTHENTICATOR_KEY.OV } as IdxAuthenticator,
      },
    };
    transaction.rawIdxState = {
      authenticators: withRawAuthenticators ? {
        value: [{
          id: AUTHENTICATOR_ID,
          methods: types.map((type) => (
            flagged.includes(type) ? { type, phishingResistantCapable: true } : { type }
          )),
        }],
      } : undefined,
    } as unknown as typeof transaction.rawIdxState;

    return transformSelectOVCustomAppMethodVerify({
      transaction,
      formBag,
      widgetProps,
    }).uischema.elements;
  };

  const lists = (elements: UISchemaElement[]) => elements
    .filter(({ type }) => type === 'AuthenticatorButtonList') as AuthenticatorButtonListElement[];
  const methodsOf = (list: AuthenticatorButtonListElement) => list.options.buttons
    .map((b) => b.options.actionParams?.['authenticator.methodType']);

  it('lists FastPass first and puts push and totp under More options', () => {
    const elements = run(['signed_nonce', 'push', 'totp'], ['signed_nonce']);

    const [firstList] = lists(elements);
    expect(methodsOf(firstList)).toEqual(['signed_nonce']);
    const accordion = elements.find(({ type }) => type === 'Accordion') as UISchemaElement & {
      elements: Array<{
        key: string;
        options: { content: { elements: AuthenticatorButtonListElement[] } };
      }>;
    };
    expect(accordion).toBeDefined();
    expect(accordion.elements[0].key).toBe('more-options');
    expect(methodsOf(accordion.elements[0].options.content.elements[0])).toEqual(['push', 'totp']);
  });

  it('keeps a flat list when only FastPass is available', () => {
    const elements = run(['signed_nonce'], ['signed_nonce']);

    expect(elements.find(({ type }) => type === 'Accordion')).toBeUndefined();
    expect(methodsOf(lists(elements)[0])).toEqual(['signed_nonce']);
  });

  it('keeps a flat list when only push and totp are available', () => {
    const elements = run(['push', 'totp'], []);

    expect(elements.find(({ type }) => type === 'Accordion')).toBeUndefined();
    expect(methodsOf(lists(elements)[0])).toEqual(['push', 'totp']);
  });

  it('keeps a flat list when the backend sends no authenticators', () => {
    const elements = run(['signed_nonce', 'push', 'totp'], [], false);

    expect(elements.find(({ type }) => type === 'Accordion')).toBeUndefined();
    expect(lists(elements)[0].options.buttons).toHaveLength(3);
  });
});
