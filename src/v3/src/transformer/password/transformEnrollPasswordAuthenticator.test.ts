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
  FieldElement,
  FormBag,
  HiddenInputElement,
  PasswordRequirementsElement,
  TitleElement,
  WidgetProps,
} from '../../types';
import { transformEnrollPasswordAuthenticator } from '.';

describe('Enroll Password Authenticator Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  let widgetProps: WidgetProps;
  beforeEach(() => {
    formBag = getStubFormBag(IDX_STEP.ENROLL_AUTHENTICATOR);
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

  it('should add title, password requirements and password enrollment elements to UI Schema for enroll PW step', () => {
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_AUTHENTICATOR,
      relatesTo: {
        value: {
          settings: {
            complexity: { minLength: 1 },
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformEnrollPasswordAuthenticator({
      transaction, formBag, widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.password.enroll.title');
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
  });

  it('should add title, password requirements and password enrollment elements to UI Schema for enroll PW step when passcode field name is newPassword', () => {
    formBag.uischema.elements = [
      {
        type: 'Field',
        label: 'Password',
        options: {
          inputMeta: { name: 'credentials.newPassword', secret: true },
          attributes: { autocomplete: 'current-password' },
        },
      } as FieldElement,
    ];
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_AUTHENTICATOR,
      relatesTo: {
        value: {
          settings: {
            complexity: { minLength: 1 },
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformEnrollPasswordAuthenticator({
      transaction, formBag, widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.password.enroll.title');
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
      .toBe('credentials.newPassword');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options.attributes?.autocomplete)
      .toBe('new-password');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options.inputMeta.name)
      .toBe('confirmPassword');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options.attributes?.autocomplete)
      .toBe('new-password');
  });

  it('should add title, and password enrollment elements to UI Schema for enroll PW step with missing password policy settings', () => {
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_AUTHENTICATOR,
      relatesTo: {
        value: {} as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformEnrollPasswordAuthenticator({
      transaction, formBag, widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.password.enroll.title');
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
  });

  it('should add title, password requirements and revoke sessions checkbox elements to UI Schema for enroll PW step', () => {
    formBag.uischema.elements.push({
      type: 'Field',
      label: 'Sign me out of all devices',
      options: {
        inputMeta: { name: 'credentials.revokeSessions', type: 'boolean' },
      },
    } as FieldElement);
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_AUTHENTICATOR,
      relatesTo: {
        value: {
          settings: {
            complexity: { minLength: 1 },
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformEnrollPasswordAuthenticator({
      transaction, formBag, widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.password.enroll.title');
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
    expect((updatedFormBag.uischema.elements[6] as FieldElement).options.inputMeta.name)
      .toBe('credentials.revokeSessions');
    expect((updatedFormBag.uischema.elements[6] as FieldElement).options.inputMeta.type)
      .toBe('boolean');
  });
});
