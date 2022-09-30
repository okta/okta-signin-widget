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
  WidgetProps,
} from '../../types';
import { transformResetPasswordAuthenticator } from './transformResetPasswordAuthenticator';

describe('Reset Password Authenticator Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;
  beforeEach(() => {
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
    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect(updatedFormBag).toMatchSnapshot();
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
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag).toMatchSnapshot();
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
    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect(updatedFormBag).toMatchSnapshot();
  });
});
