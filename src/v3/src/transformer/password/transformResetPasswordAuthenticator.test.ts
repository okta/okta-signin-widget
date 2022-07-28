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

import { IdxAuthenticator } from '@okta/okta-auth-js';

import { IDX_STEP } from '../../constants';
import { getStubTransactionWithNextStep } from '../../mocks/utils/utils';
import {
  ButtonElement,
  FieldElement,
  FormBag,
  PasswordRequirementsElement,
  PasswordWithConfirmationElement,
  TitleElement,
  UISchemaLayoutType,
  WidgetProps,
} from '../../types';
import { transformResetPasswordAuthenticator } from './transformResetPasswordAuthenticator';

describe('Reset Password Authenticator Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  let widgetProps: WidgetProps;
  beforeEach(() => {
    formBag = {
      dataSchema: {},
      schema: {},
      uischema: {
        type: UISchemaLayoutType.VERTICAL,
        elements: [{
          type: 'Control',
          name: 'credentials.passcode',
          label: 'Password',
          options: {
            inputMeta: { name: 'credentials.passcode', secret: true },
            attributes: { autocomplete: 'current-password' },
          },
        } as FieldElement],
      },
      data: { 'credentials.passcode': undefined },
    };
    transaction.context = {
      ...transaction.context,
      user: {
        type: 'string',
        value: {
          identifier: 'someuser@noemail.com',
        },
      },
    };
    widgetProps = {};
  });

  it('should add updated title element and submit button to UI Schema for reset PW step', () => {
    transaction.nextStep = {
      name: IDX_STEP.RESET_AUTHENTICATOR,
      relatesTo: {
        value: {
          settings: {
            complexity: { minLength: 1 },
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformResetPasswordAuthenticator({
      transaction, formBag, widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.reset.title.generic');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).type)
      .toBe('PasswordRequirements');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.userInfo?.identifier).toBe('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.settings)
      .toEqual({ complexity: { minLength: 1 } });
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.validationDelayMs).toBe(50);
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.id)
      .toBe('password-authenticator--list');
    expect((updatedFormBag.uischema.elements[2] as PasswordWithConfirmationElement).type)
      .toBe('PasswordWithConfirmation');
    expect((updatedFormBag.uischema.elements[2] as PasswordWithConfirmationElement)
      .options.input.name).toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[2] as PasswordWithConfirmationElement)
      .options.input.options.inputMeta.secret).toBe(true);
    expect((updatedFormBag.uischema.elements[2] as PasswordWithConfirmationElement)
      .options.input.options.attributes?.autocomplete).toBe('new-password');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement)
      .label).toBe('password.reset');
  });

  it('should add updated title element and submit button to UI Schema for reset PW step without password policy settings', () => {
    transaction.nextStep = {
      name: IDX_STEP.RESET_AUTHENTICATOR,
      relatesTo: {
        value: {} as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformResetPasswordAuthenticator({
      transaction, formBag, widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.reset.title.generic');
    expect((updatedFormBag.uischema.elements[1] as PasswordWithConfirmationElement).type)
      .toBe('PasswordWithConfirmation');
    expect((updatedFormBag.uischema.elements[1] as PasswordWithConfirmationElement)
      .options.input.name).toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[1] as PasswordWithConfirmationElement)
      .options.input.options.inputMeta.secret).toBe(true);
    expect((updatedFormBag.uischema.elements[1] as PasswordWithConfirmationElement)
      .options.input.options.attributes?.autocomplete).toBe('new-password');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement)
      .label).toBe('password.reset');
  });

  it('should add updated title element and submit button to UI Schema for reset PW step with brandName provided', () => {
    widgetProps = { brandName: 'Acme Corp.' };
    transaction.nextStep = {
      name: IDX_STEP.RESET_AUTHENTICATOR,
      relatesTo: {
        value: {
          settings: {
            complexity: { minLength: 1 },
          },
        } as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformResetPasswordAuthenticator({
      transaction, formBag, widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.reset.title.specific');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).type)
      .toBe('PasswordRequirements');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.userInfo?.identifier).toBe('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.settings)
      .toEqual({ complexity: { minLength: 1 } });
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.validationDelayMs).toBe(50);
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.id)
      .toBe('password-authenticator--list');
    expect((updatedFormBag.uischema.elements[2] as PasswordWithConfirmationElement).type)
      .toBe('PasswordWithConfirmation');
    expect((updatedFormBag.uischema.elements[2] as PasswordWithConfirmationElement)
      .options.input.name).toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[2] as PasswordWithConfirmationElement)
      .options.input.options.inputMeta.secret).toBe(true);
    expect((updatedFormBag.uischema.elements[2] as PasswordWithConfirmationElement)
      .options.input.options.attributes?.autocomplete).toBe('new-password');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement)
      .label).toBe('password.reset');
  });
});
