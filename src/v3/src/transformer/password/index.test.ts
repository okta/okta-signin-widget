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

import { ControlElement } from '@jsonforms/core';
import { IDX_STEP } from 'src/constants';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import { FormBag, WidgetProps } from 'src/types';

import { transformPasswordAuthenticator } from '.';

describe('Password Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  let mockProps: WidgetProps;
  beforeEach(() => {
    formBag = {
      schema: {},
      uischema: {
        type: 'VerticalLayout',
        elements: [],
      },
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
    mockProps = {};
  });

  it('should not modify formBag when transaction is missing relatesTo object', () => {
    expect(transformPasswordAuthenticator(transaction, formBag, mockProps)).toBe(formBag);
  });

  it('should not modify formBag when transaction doesnt have password settings', () => {
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_AUTHENTICATOR,
      relatesTo: {
        value: {
          displayName: '',
          id: '',
          key: '',
          methods: [],
          type: '',
        },
      },
    };

    expect(transformPasswordAuthenticator(transaction, formBag, mockProps)).toBe(formBag);
  });

  it('should add password and confirm password elements to UI Schema for enroll PW step', () => {
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_AUTHENTICATOR,
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
    formBag.schema.properties = {
      credentials: {
        type: 'object',
        properties: {
          password: {
            type: 'string',
          },
        },
      },
    };
    const updatedFormBag = transformPasswordAuthenticator(transaction, formBag, mockProps);

    // Verify Schema
    expect(updatedFormBag.schema.properties?.credentials?.properties?.confirmPassword?.type)
      .toBe('string');
    expect(
      updatedFormBag.schema.properties?.credentials?.properties?.confirmPassword?.const?.$data,
    ).toBe('1/password');
    expect(
      updatedFormBag.schema.properties?.credentials?.properties?.confirmPassword?.minLength,
    ).toBe(1);

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
    expect(updatedFormBag.uischema.elements[0]?.options?.content)
      .toBe('oie.password.enroll.title');
    expect(updatedFormBag.uischema.elements[1]?.type).toBe('PasswordRequirements');
    expect(updatedFormBag.uischema.elements[1]?.options?.userInfo?.identifier)
      .toEqual('someuser@noemail.com');
    expect(updatedFormBag.uischema.elements[1]?.options?.data)
      .toEqual({ complexity: {} });
    expect(updatedFormBag.uischema.elements[1]?.options?.fieldKey).toBe('credentials.password');
    expect(updatedFormBag.uischema.elements[1]?.options?.validationDelayMs).toBe(50);
    expect(updatedFormBag.uischema.elements[1]?.options?.id)
      .toBe('#/properties/passwordRequirements');
    expect(updatedFormBag.uischema.elements[2]?.options?.secret).toBe(true);
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('oie.password.confirmPasswordLabel');
  });

  it('should add password and confirm password elements to UI Schema for reset PW step', () => {
    transaction.nextStep = {
      name: IDX_STEP.RESET_AUTHENTICATOR,
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
    formBag.schema.properties = {
      credentials: {
        type: 'object',
        properties: {
          passcode: {
            type: 'string',
          },
        },
      },
    };
    const updatedFormBag = transformPasswordAuthenticator(transaction, formBag, mockProps);

    // Verify Schema
    expect(updatedFormBag.schema.properties?.credentials?.properties?.confirmPassword?.type)
      .toBe('string');
    expect(
      updatedFormBag.schema.properties?.credentials?.properties?.confirmPassword?.const?.$data,
    ).toBe('1/passcode');
    expect(
      updatedFormBag.schema.properties?.credentials?.properties?.confirmPassword?.minLength,
    ).toBe(1);

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
    expect(updatedFormBag.uischema.elements[0]?.options?.content)
      .toBe('password.reset.title.generic');
    expect(updatedFormBag.uischema.elements[1]?.type).toBe('PasswordRequirements');
    expect(updatedFormBag.uischema.elements[1]?.options?.userInfo?.identifier)
      .toEqual('someuser@noemail.com');
    expect(updatedFormBag.uischema.elements[1]?.options?.data)
      .toEqual({ complexity: {} });
    expect(updatedFormBag.uischema.elements[1]?.options?.fieldKey).toBe('credentials.passcode');
    expect(updatedFormBag.uischema.elements[1]?.options?.validationDelayMs).toBe(50);
    expect(updatedFormBag.uischema.elements[1]?.options?.id)
      .toBe('#/properties/passwordRequirements');
    expect(updatedFormBag.uischema.elements[2]?.options?.secret).toBe(true);
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('oie.password.confirmPasswordLabel');
  });

  it('should add password and confirm password elements to UI Schema for reset PW step with brandName provided', () => {
    mockProps = { brandName: 'Acme Corp.' };
    transaction.nextStep = {
      name: IDX_STEP.RESET_AUTHENTICATOR,
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
    formBag.schema.properties = {
      credentials: {
        type: 'object',
        properties: {
          passcode: {
            type: 'string',
          },
        },
      },
    };
    const updatedFormBag = transformPasswordAuthenticator(transaction, formBag, mockProps);

    // Verify Schema
    expect(updatedFormBag.schema.properties?.credentials?.properties?.confirmPassword?.type)
      .toBe('string');
    expect(
      updatedFormBag.schema.properties?.credentials?.properties?.confirmPassword?.const?.$data,
    ).toBe('1/passcode');
    expect(
      updatedFormBag.schema.properties?.credentials?.properties?.confirmPassword?.minLength,
    ).toBe(1);

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
    expect(updatedFormBag.uischema.elements[0]?.options?.content)
      .toBe('password.reset.title.specific');
    expect(updatedFormBag.uischema.elements[0]?.options?.contentParams)
      .toEqual(['Acme Corp.']);
    expect(updatedFormBag.uischema.elements[1]?.type).toBe('PasswordRequirements');
    expect(updatedFormBag.uischema.elements[1]?.options?.userInfo?.identifier)
      .toEqual('someuser@noemail.com');
    expect(updatedFormBag.uischema.elements[1]?.options?.data)
      .toEqual({ complexity: {} });
    expect(updatedFormBag.uischema.elements[1]?.options?.fieldKey).toBe('credentials.passcode');
    expect(updatedFormBag.uischema.elements[1]?.options?.validationDelayMs).toBe(50);
    expect(updatedFormBag.uischema.elements[1]?.options?.id)
      .toBe('#/properties/passwordRequirements');
    expect(updatedFormBag.uischema.elements[2]?.options?.secret).toBe(true);
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('oie.password.confirmPasswordLabel');
  });

  it('should add password and confirm password elements to UI Schema for re-enroll PW step', () => {
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
    formBag.schema.properties = {
      credentials: {
        type: 'object',
        properties: {
          newPassword: {
            type: 'string',
          },
        },
      },
    };
    const updatedFormBag = transformPasswordAuthenticator(transaction, formBag, mockProps);

    // Verify Schema
    expect(updatedFormBag.schema.properties?.credentials?.properties?.confirmPassword?.type)
      .toBe('string');
    expect(
      updatedFormBag.schema.properties?.credentials?.properties?.confirmPassword?.const?.$data,
    ).toBe('1/newPassword');
    expect(
      updatedFormBag.schema.properties?.credentials?.properties?.confirmPassword?.minLength,
    ).toBe(1);

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
    expect(updatedFormBag.uischema.elements[0]?.options?.content)
      .toBe('password.expired.title.generic');
    expect(updatedFormBag.uischema.elements[1]?.type).toBe('PasswordRequirements');
    expect(updatedFormBag.uischema.elements[1]?.options?.userInfo?.identifier)
      .toEqual('someuser@noemail.com');
    expect(updatedFormBag.uischema.elements[1]?.options?.data)
      .toEqual({ complexity: {} });
    expect(updatedFormBag.uischema.elements[1]?.options?.fieldKey).toBe('credentials.newPassword');
    expect(updatedFormBag.uischema.elements[1]?.options?.validationDelayMs).toBe(50);
    expect(updatedFormBag.uischema.elements[1]?.options?.id)
      .toBe('#/properties/passwordRequirements');
    expect(updatedFormBag.uischema.elements[2]?.options?.secret).toBe(true);
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('oie.password.confirmPasswordLabel');
  });

  it('should add password and confirm password elements to UI Schema for re-enroll PW step with brandName provided', () => {
    mockProps = { brandName: 'Acme Corp.' };
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
    formBag.schema.properties = {
      credentials: {
        type: 'object',
        properties: {
          newPassword: {
            type: 'string',
          },
        },
      },
    };
    const updatedFormBag = transformPasswordAuthenticator(transaction, formBag, mockProps);

    // Verify Schema
    expect(updatedFormBag.schema.properties?.credentials?.properties?.confirmPassword?.type)
      .toBe('string');
    expect(
      updatedFormBag.schema.properties?.credentials?.properties?.confirmPassword?.const?.$data,
    ).toBe('1/newPassword');
    expect(
      updatedFormBag.schema.properties?.credentials?.properties?.confirmPassword?.minLength,
    ).toBe(1);

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
    expect(updatedFormBag.uischema.elements[0]?.options?.content)
      .toBe('password.expired.title.specific');
    expect(updatedFormBag.uischema.elements[0]?.options?.contentParams)
      .toEqual(['Acme Corp.']);
    expect(updatedFormBag.uischema.elements[1]?.type).toBe('PasswordRequirements');
    expect(updatedFormBag.uischema.elements[1]?.options?.userInfo?.identifier)
      .toEqual('someuser@noemail.com');
    expect(updatedFormBag.uischema.elements[1]?.options?.data)
      .toEqual({ complexity: {} });
    expect(updatedFormBag.uischema.elements[1]?.options?.fieldKey).toBe('credentials.newPassword');
    expect(updatedFormBag.uischema.elements[1]?.options?.validationDelayMs).toBe(50);
    expect(updatedFormBag.uischema.elements[1]?.options?.id)
      .toBe('#/properties/passwordRequirements');
    expect(updatedFormBag.uischema.elements[2]?.options?.secret).toBe(true);
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('oie.password.confirmPasswordLabel');
  });
});
