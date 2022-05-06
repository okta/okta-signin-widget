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
import { FormBag } from 'src/types';

import { transformPasswordAuthenticator } from '.';

describe('Password Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  beforeEach(() => {
    formBag = {
      envelope: {},
      data: {},
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
  });

  it('should not modify formBag when Idx response is missing authenticator object', () => {
    expect(transformPasswordAuthenticator(transaction, formBag)).toBe(formBag);
  });

  it('should not modify formBag when Idx response doesnt have password settings defined', () => {
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_AUTHENTICATOR,
      authenticator: {
        displayName: '',
        id: '',
        key: '',
        methods: [],
        type: '',
      },
    };

    expect(transformPasswordAuthenticator(transaction, formBag)).toBe(formBag);
  });

  it('should add password and confirm password elements to UI Schema for enroll PW step', () => {
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_AUTHENTICATOR,
      authenticator: {
        displayName: '',
        id: '',
        key: '',
        methods: [],
        type: '',
        settings: {
          complexity: {},
        },
      },
    };
    formBag.schema.properties = {
      password: {
        type: 'string',
      },
    };
    const updatedFormBag = transformPasswordAuthenticator(transaction, formBag);

    // Verify Schema
    expect(updatedFormBag.schema.properties?.confirmPassword?.type).toBe('string');
    expect(updatedFormBag.schema.properties?.confirmPassword?.const?.$data).toBe('1/password');
    expect(updatedFormBag.schema.properties?.confirmPassword?.minLength).toBe(1);

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
    expect(updatedFormBag.uischema.elements[1]?.options?.format).toBe('PasswordRequirements');
    expect(updatedFormBag.uischema.elements[1]?.options?.userInfo)
      .toEqual({ identifier: 'someuser@noemail.com' });
    expect(updatedFormBag.uischema.elements[1]?.options?.data)
      .toEqual(transaction.nextStep.authenticator?.settings);
    expect(updatedFormBag.uischema.elements[1]?.options?.fieldKey).toBe('password');
    expect(updatedFormBag.uischema.elements[1]?.options?.validationDelayMs).toBe(50);
    expect(updatedFormBag.uischema.elements[2]?.options?.format).toBe('password');
  });

  it('should add password and confirm password elements to UI Schema for reset PW step', () => {
    transaction.nextStep = {
      name: IDX_STEP.RESET_AUTHENTICATOR,
      authenticator: {
        displayName: '',
        id: '',
        key: '',
        methods: [],
        type: '',
        settings: {
          complexity: {},
        },
      },
    };
    formBag.schema.properties = {
      newPassword: {
        type: 'string',
      },
    };
    const updatedFormBag = transformPasswordAuthenticator(transaction, formBag);

    // Verify Schema
    expect(updatedFormBag.schema.properties?.confirmPassword?.type).toBe('string');
    expect(updatedFormBag.schema.properties?.confirmPassword?.const?.$data).toBe('1/newPassword');
    expect(updatedFormBag.schema.properties?.confirmPassword?.minLength).toBe(1);

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
    expect(updatedFormBag.uischema.elements[1]?.options?.format).toBe('PasswordRequirements');
    expect(updatedFormBag.uischema.elements[1]?.options?.userInfo)
      .toEqual({ identifier: 'someuser@noemail.com' });
    expect(updatedFormBag.uischema.elements[1]?.options?.data)
      .toEqual(transaction.nextStep.authenticator?.settings);
    expect(updatedFormBag.uischema.elements[1]?.options?.fieldKey).toBe('newPassword');
    expect(updatedFormBag.uischema.elements[1]?.options?.validationDelayMs).toBe(50);
    expect(updatedFormBag.uischema.elements[2]?.options?.format).toBe('password');
  });

  it('should add password and confirm password elements to UI Schema for expired PW step', () => {
    transaction.nextStep = {
      name: IDX_STEP.REENROLL_AUTHENTICATOR,
      authenticator: {
        displayName: '',
        id: '',
        key: '',
        methods: [],
        type: '',
        settings: {
          complexity: {},
        },
      },
    };
    formBag.schema.properties = {
      newPassword: {
        type: 'string',
      },
    };
    const updatedFormBag = transformPasswordAuthenticator(transaction, formBag);

    // Verify Schema
    expect(updatedFormBag.schema.properties?.confirmPassword?.type).toBe('string');
    expect(updatedFormBag.schema.properties?.confirmPassword?.const?.$data).toBe('1/newPassword');
    expect(updatedFormBag.schema.properties?.confirmPassword?.minLength).toBe(1);

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
    expect(updatedFormBag.uischema.elements[1]?.options?.format).toBe('PasswordRequirements');
    expect(updatedFormBag.uischema.elements[1]?.options?.userInfo)
      .toEqual({ identifier: 'someuser@noemail.com' });
    expect(updatedFormBag.uischema.elements[1]?.options?.data)
      .toEqual(transaction.nextStep.authenticator?.settings);
    expect(updatedFormBag.uischema.elements[1]?.options?.fieldKey).toBe('newPassword');
    expect(updatedFormBag.uischema.elements[1]?.options?.validationDelayMs).toBe(50);
    expect(updatedFormBag.uischema.elements[2]?.options?.format).toBe('password');
  });

  it('should add password and confirm password elements to UI Schema for step with'
    + ' passcode as schema property', () => {
    transaction.nextStep = {
      name: IDX_STEP.REENROLL_AUTHENTICATOR,
      authenticator: {
        displayName: '',
        id: '',
        key: '',
        methods: [],
        type: '',
        settings: {
          complexity: {},
        },
      },
    };
    formBag.schema.properties = {
      passcode: {
        type: 'string',
      },
    };
    const updatedFormBag = transformPasswordAuthenticator(transaction, formBag);

    // Verify Schema
    expect(updatedFormBag.schema.properties?.confirmPassword?.type).toBe('string');
    expect(updatedFormBag.schema.properties?.confirmPassword?.const?.$data).toBe('1/passcode');
    expect(updatedFormBag.schema.properties?.confirmPassword?.minLength).toBe(1);

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
    expect(updatedFormBag.uischema.elements[1]?.options?.format).toBe('PasswordRequirements');
    expect(updatedFormBag.uischema.elements[1]?.options?.userInfo)
      .toEqual({ identifier: 'someuser@noemail.com' });
    expect(updatedFormBag.uischema.elements[1]?.options?.data)
      .toEqual(transaction.nextStep.authenticator?.settings);
    expect(updatedFormBag.uischema.elements[1]?.options?.fieldKey).toBe('passcode');
    expect(updatedFormBag.uischema.elements[1]?.options?.validationDelayMs).toBe(50);
    expect(updatedFormBag.uischema.elements[2]?.options?.format).toBe('password');
  });
});
