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

import { IdxAuthenticator, IdxTransaction } from '@okta/okta-auth-js';
import { IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';

import {
  FieldElement,
  FormBag,
  WidgetProps,
} from '../../types';
import { transformExpiredPasswordWarningAuthenticator } from './transformExpiredPasswordWarningAuthenticator';

describe('Expired Password Warning Authenticator Transformer Tests', () => {
  let transaction: IdxTransaction;
  let formBag: FormBag;
  let widgetProps: WidgetProps;
  beforeEach(() => {
    formBag = getStubFormBag();
    transaction = getStubTransactionWithNextStep();
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

  it('should add updated title element and submit button elements w/ 5 days to expire to UI Schema', () => {
    transaction.nextStep = {
      name: IDX_STEP.REENROLL_AUTHENTICATOR_WARNING,
      relatesTo: {
        value: {
          settings: {
            complexity: {},
            // @ts-ignore IdxAuthenticator.settings missing daysToExpiry property
            daysToExpiry: 5,
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformExpiredPasswordWarningAuthenticator({
      transaction,
      formBag,
      widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add updated title element and submit button elements w/ 0 days to expire to UI Schema', () => {
    transaction.nextStep = {
      name: IDX_STEP.REENROLL_AUTHENTICATOR_WARNING,
      relatesTo: {
        value: {
          settings: {
            complexity: {},
            // @ts-ignore IdxAuthenticator.settings missing daysToExpiry property
            daysToExpiry: 0,
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformExpiredPasswordWarningAuthenticator({
      transaction,
      formBag,
      widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add updated title element and submit button elements when daysToExpire is not present to UI Schema', () => {
    transaction.nextStep = {
      name: IDX_STEP.REENROLL_AUTHENTICATOR_WARNING,
      relatesTo: {
        value: {
          settings: {
            complexity: {},
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformExpiredPasswordWarningAuthenticator({
      transaction,
      formBag,
      widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add updated title element, submit button, and additional subtitle elements to UI Schema for expired PW step with brandName provided', () => {
    const mockBrandName = 'Acme Corp.';
    widgetProps = { brandName: mockBrandName };
    transaction.nextStep = {
      name: IDX_STEP.REENROLL_AUTHENTICATOR_WARNING,
      relatesTo: {
        value: {
          settings: {
            complexity: {},
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformExpiredPasswordWarningAuthenticator({
      transaction,
      formBag,
      widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add updated title element, submit button, and additional subtitle elements to UI Schema for expired PW step with messages in the transaction', () => {
    transaction.nextStep = {
      name: IDX_STEP.REENROLL_AUTHENTICATOR_WARNING,
      relatesTo: {
        value: {
          settings: {
            complexity: {},
          },
        } as unknown as IdxAuthenticator,
      },
    };
    transaction.messages = [{
      message: 'When your password is locked, you cannot access the account',
      class: 'INFO',
      i18n: { key: 'some.mock.key' },
    }];
    const updatedFormBag = transformExpiredPasswordWarningAuthenticator({
      transaction,
      formBag,
      widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add updated title element, submit button and skip button elements to UI Schema for expired PW step with skip remediation in the transaction', () => {
    transaction.nextStep = {
      name: IDX_STEP.REENROLL_AUTHENTICATOR_WARNING,
      relatesTo: {
        value: {
          settings: {
            complexity: {},
          },
        } as unknown as IdxAuthenticator,
      },
    };
    transaction.availableSteps = [{
      name: 'skip',
      action: jest.fn(),
    }];
    const updatedFormBag = transformExpiredPasswordWarningAuthenticator({
      transaction,
      formBag,
      widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect(updatedFormBag).toMatchSnapshot();
  });
});
