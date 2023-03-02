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
import { getStubFormBag, getStubTransactionWithNextStep } from '../../mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  FieldElement,
  FormBag,
  HiddenInputElement,
  PasswordMatchesElement,
  PasswordRequirementsElement,
  TitleElement,
  WidgetProps,
} from '../../types';
import { transformExpiredPasswordAuthenticator } from '.';

describe('Expired Password Authenticator Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  let widgetProps: WidgetProps;
  beforeEach(() => {
    formBag = getStubFormBag();
    formBag.uischema.elements = [
      {
        type: 'Field',
        label: 'Password',
        options: {
          inputMeta: { name: 'credentials.passcode', secret: true },
          attributes: { autocomplete: 'current-password' },
        },
      } as FieldElement,
    ];
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

  it('should add updated title element and submit button to UI Schema for expired PW step', () => {
    transaction.nextStep = {
      name: IDX_STEP.REENROLL_AUTHENTICATOR,
      relatesTo: {
        value: {
          settings: {
            complexity: { minLength: 1 },
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformExpiredPasswordAuthenticator({
      transaction, formBag, widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.expired.title.generic');
    expect(updatedFormBag.uischema.elements[1]?.type).toBe('PasswordRequirements');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.userInfo?.identifier).toBe('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.header)
      .toBe('password.complexity.requirements.header');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.settings)
      .toEqual({ complexity: { minLength: 1 } });
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.validationDelayMs).toBe(50);
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.id)
      .toBe('password-authenticator--list');
    expect(updatedFormBag.uischema.elements[2].type).toBe('HiddenInput');
    expect((updatedFormBag.uischema.elements[2] as HiddenInputElement).options.value)
      .toBe('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options.inputMeta.name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options.attributes?.autocomplete)
      .toBe('new-password');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options.inputMeta.name)
      .toBe('confirmPassword');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options.attributes?.autocomplete)
      .toBe('new-password');
    expect(updatedFormBag.uischema.elements[5]?.type).toBe('PasswordMatches');
    expect((updatedFormBag.uischema.elements[5] as PasswordMatchesElement)
      .options?.validationDelayMs).toBe(50);
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).label).toBe('password.expired.submit');
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).options.step)
      .toBe('reenroll-authenticator');
  });

  it('should add updated title element and submit button to UI Schema for expired PW step with brandName provided', () => {
    widgetProps = { brandName: 'Acme Corp.' };
    transaction.nextStep = {
      name: IDX_STEP.REENROLL_AUTHENTICATOR,
      relatesTo: {
        value: {
          settings: {
            complexity: { minLength: 1 },
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformExpiredPasswordAuthenticator({
      transaction, formBag, widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.expired.title.specific');
    expect(updatedFormBag.uischema.elements[1]?.type).toBe('PasswordRequirements');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.userInfo?.identifier).toBe('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.header)
      .toBe('password.complexity.requirements.header');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.settings)
      .toEqual({ complexity: { minLength: 1 } });
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.validationDelayMs).toBe(50);
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.id)
      .toBe('password-authenticator--list');
    expect(updatedFormBag.uischema.elements[2].type).toBe('HiddenInput');
    expect((updatedFormBag.uischema.elements[2] as HiddenInputElement).options.value)
      .toBe('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options.inputMeta.name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options.attributes?.autocomplete)
      .toBe('new-password');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options.inputMeta.name)
      .toBe('confirmPassword');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options.attributes?.autocomplete)
      .toBe('new-password');
    expect(updatedFormBag.uischema.elements[5]?.type).toBe('PasswordMatches');
    expect((updatedFormBag.uischema.elements[5] as PasswordMatchesElement)
      .options?.validationDelayMs).toBe(50);
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).label).toBe('password.expired.submit');
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).options.step)
      .toBe('reenroll-authenticator');
  });

  it('should add updated title element and submit button to UI Schema for expired PW step without password policy settings', () => {
    transaction.nextStep = {
      name: IDX_STEP.REENROLL_AUTHENTICATOR,
      relatesTo: {
        value: {} as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformExpiredPasswordAuthenticator({
      transaction, formBag, widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.expired.title.generic');
    expect(updatedFormBag.uischema.elements[1].type).toBe('HiddenInput');
    expect((updatedFormBag.uischema.elements[1] as HiddenInputElement).options.value)
      .toBe('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options.inputMeta.name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options.attributes?.autocomplete)
      .toBe('new-password');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options.inputMeta.name)
      .toBe('confirmPassword');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options.attributes?.autocomplete)
      .toBe('new-password');
    expect(updatedFormBag.uischema.elements[4]?.type).toBe('PasswordMatches');
    expect((updatedFormBag.uischema.elements[4] as PasswordMatchesElement)
      .options?.validationDelayMs).toBe(50);
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).label).toBe('password.expired.submit');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).options.step)
      .toBe('reenroll-authenticator');
  });
});
