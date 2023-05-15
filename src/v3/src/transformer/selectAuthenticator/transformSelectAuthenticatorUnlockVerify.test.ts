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

import { IdxOption } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';
import { AUTHENTICATOR_KEY, IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  AuthenticatorButtonElement,
  AuthenticatorButtonListElement,
  ButtonType,
  FieldElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformSelectAuthenticatorUnlockVerify } from '.';

const getMockAuthenticatorButtons = (): AuthenticatorButtonElement[] => {
  const authenticators = [];
  authenticators.push({
    type: 'AuthenticatorButton',
    label: 'Email',
    options: {
      type: ButtonType.BUTTON,
      key: AUTHENTICATOR_KEY.EMAIL,
      ctaLabel: 'Select',
      actionParams: {
        'authenticator.id': '123abc',
      },
      step: IDX_STEP.SELECT_AUTHENTICATOR_UNLOCK,
    },
  } as AuthenticatorButtonElement);
  return authenticators;
};

jest.mock('./utils', () => ({
  getAuthenticatorVerifyButtonElements: (
    options: IdxOption[],
  ) => (options?.length ? getMockAuthenticatorButtons() : []),
}));

describe('Unlock Verification Authenticator Selector Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {};
  const formBag = getStubFormBag();
  beforeEach(() => {
    formBag.uischema.elements = [{ type: 'Field', options: { inputMeta: { name: 'identifier' } } } as FieldElement];
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_UNLOCK,
      inputs: [
        {
          name: 'authenticator',
          options: [
            {
              label: 'Email',
              value: 'okta_email',
            } as IdxOption,
          ],
        },
        {
          name: 'identifier',
          label: 'Username',
          required: true,
        },
      ],
    };
  });

  it('should not transform elements when IDX Step does not exist in remediations', () => {
    expect(transformSelectAuthenticatorUnlockVerify({ transaction, formBag, widgetProps }))
      .toEqual(formBag);
  });

  it('should not transform elements when inputs are missing from step', () => {
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_UNLOCK,
    };

    expect(transformSelectAuthenticatorUnlockVerify({ transaction, formBag, widgetProps }))
      .toEqual(formBag);
  });

  it('should add UI elements for unlock verification authenticator selector', () => {
    const updatedFormBag = transformSelectAuthenticatorUnlockVerify({
      transaction,
      formBag,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('unlockaccount');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options?.inputMeta.name)
      .toBe('identifier');
    expect(updatedFormBag.uischema.elements[2].type).toBe('AuthenticatorButtonList');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.dataSe)).toBe('authenticator-verify-list');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons.length)).toBe(1);
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.actionParams?.['authenticator.id']).toBe('123abc');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.step).toBe('select-authenticator-unlock-account');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.type).toBe(ButtonType.BUTTON);
  });
});
