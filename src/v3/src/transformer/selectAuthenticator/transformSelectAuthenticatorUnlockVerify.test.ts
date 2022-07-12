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

import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { AUTHENTICATOR_KEY, IDX_STEP } from 'src/constants';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  AuthenticatorButtonElement,
  FormBag,
  TitleElement,
  UISchemaLayoutType,
  WidgetProps,
} from 'src/types';

import { transformSelectAuthenticatorUnlockVerify } from '.';

const getMockAuthenticatorButtons = (): AuthenticatorButtonElement[] => {
  const authenticators = [];
  authenticators.push({
    type: 'AuthenticatorButton',
    label: 'Email',
    options: {
      key: AUTHENTICATOR_KEY.EMAIL,
      ctaLabel: 'Select',
      actionParams: {
        'authenticator.id': '123abc',
      },
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
  const mockProps: WidgetProps = {};
  let formBag: FormBag;
  beforeEach(() => {
    formBag = {
      data: {},
      schema: {},
      uischema: {
        type: UISchemaLayoutType.VERTICAL,
        elements: [],
      },
    };
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_UNLOCK,
      inputs: [{
        name: 'authenticator',
        options: [
          {
            label: 'Email',
            value: 'okta_email',
          } as IdxOption,
        ],
      }],
    };
  });

  it('should not transform elements when IDX Step does not exist in remediations', () => {
    expect(transformSelectAuthenticatorUnlockVerify(transaction, formBag, mockProps))
      .toEqual(formBag);
  });

  it('should not transform elements when inputs are missing from step', () => {
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_UNLOCK,
    };

    expect(transformSelectAuthenticatorUnlockVerify(transaction, formBag, mockProps))
      .toEqual(formBag);
  });

  it('should add UI elements for unlock verification authenticator selector', () => {
    const updatedFormBag = transformSelectAuthenticatorUnlockVerify(
      transaction,
      formBag,
      mockProps,
    );

    expect(updatedFormBag.uischema.elements.length).toBe(2);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('unlockaccount');
    expect(updatedFormBag.uischema.elements[1].type).toBe('AuthenticatorButton');
    expect(((updatedFormBag.uischema.elements[1] as AuthenticatorButtonElement)
      .options.actionParams?.['authenticator.id'])).toBe('123abc');
  });
});
