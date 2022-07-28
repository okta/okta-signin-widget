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

import { IDX_STEP } from 'src/constants';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  FieldElement,
  FormBag,
  PasswordRequirementsElement,
  TitleElement,
  UISchemaLayoutType,
  WidgetProps,
} from 'src/types';

import { transformExpiredPasswordAuthenticator } from '.';

describe('Expired Password Authenticator Transformer Tests', () => {
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

  it('should add updated title element and submit button to UI Schema for expired PW step', () => {
    transaction.nextStep = {
      name: IDX_STEP.REENROLL_AUTHENTICATOR,
      relatesTo: {
        value: {
          displayName: '',
          id: '',
          key: '',
          methods: [],
          type: '',
          settings: {
            complexity: {},
          },
        },
      },
    };
    const updatedFormBag = transformExpiredPasswordAuthenticator({
      transaction, formBag, widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.expired.title.generic');
    expect(updatedFormBag.uischema.elements[1]?.type).toBe('PasswordRequirements');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.userInfo?.identifier).toEqual('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.settings)
      .toEqual({ complexity: {} });
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.fieldKey)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.validationDelayMs).toBe(50);
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.id)
      .toBe('password-authenticator--list');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options?.inputMeta.secret)
      .toBe(true);
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options?.attributes?.autocomplete)
      .toBe('new-password');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options?.inputMeta.secret)
      .toBe(true);
    expect((updatedFormBag.uischema.elements[3] as FieldElement).label)
      .toBe('oie.password.confirmPasswordLabel');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).label).toBe('password.expired.submit');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should add updated title element and submit button to UI Schema for expired PW step with brandName provided', () => {
    widgetProps = { brandName: 'Acme Corp.' };
    transaction.nextStep = {
      name: IDX_STEP.REENROLL_AUTHENTICATOR,
      relatesTo: {
        value: {
          displayName: '',
          id: '',
          key: '',
          methods: [],
          type: '',
          settings: {
            complexity: {},
          },
        },
      },
    };
    const updatedFormBag = transformExpiredPasswordAuthenticator({
      transaction, formBag, widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.expired.title.specific');
    expect(updatedFormBag.uischema.elements[1]?.type).toBe('PasswordRequirements');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.userInfo?.identifier).toBe('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.settings)
      .toEqual({ complexity: {} });
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.fieldKey)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.validationDelayMs).toBe(50);
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.id)
      .toBe('password-authenticator--list');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options?.inputMeta.secret)
      .toBe(true);
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options?.attributes?.autocomplete)
      .toBe('new-password');
    expect((updatedFormBag.uischema.elements[3] as FieldElement)?.options?.inputMeta.secret)
      .toBe(true);
    expect((updatedFormBag.uischema.elements[3] as FieldElement).label)
      .toBe('oie.password.confirmPasswordLabel');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options?.targetKey)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).label).toBe('password.expired.submit');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });
});
