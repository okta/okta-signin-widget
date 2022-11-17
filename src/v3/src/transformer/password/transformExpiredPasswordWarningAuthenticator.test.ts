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
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  FormBag,
  HiddenInputElement,
  LinkElement,
  PasswordMatchesElement,
  PasswordRequirementsElement,
  TitleElement,
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
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.expiring.title');
    expect(updatedFormBag.uischema.elements[1]?.type).toBe('PasswordRequirements');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.userInfo?.identifier).toBe('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.header)
      .toBe('password.complexity.requirements.header');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.settings)
      .toEqual({ complexity: {}, daysToExpiry: 5 });
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
      .toBe('reenroll-authenticator-warning');
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
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.expiring.today');
    expect(updatedFormBag.uischema.elements[1]?.type).toBe('PasswordRequirements');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.userInfo?.identifier).toBe('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.header)
      .toBe('password.complexity.requirements.header');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.settings)
      .toEqual({ complexity: {}, daysToExpiry: 0 });
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
      .toBe('reenroll-authenticator-warning');
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
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.expiring.soon');
    expect(updatedFormBag.uischema.elements[1]?.type).toBe('PasswordRequirements');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.userInfo?.identifier).toBe('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.header)
      .toBe('password.complexity.requirements.header');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.settings)
      .toEqual({ complexity: {} });
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
      .toBe('reenroll-authenticator-warning');
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
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(8);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.expiring.soon');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('password.expiring.subtitle.specific');
    expect(updatedFormBag.uischema.elements[2]?.type).toBe('PasswordRequirements');
    expect((updatedFormBag.uischema.elements[2] as PasswordRequirementsElement)
      .options?.userInfo?.identifier).toBe('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[2] as PasswordRequirementsElement).options?.header)
      .toBe('password.complexity.requirements.header');
    expect((updatedFormBag.uischema.elements[2] as PasswordRequirementsElement).options?.settings)
      .toEqual({ complexity: {} });
    expect((updatedFormBag.uischema.elements[2] as PasswordRequirementsElement)
      .options?.validationDelayMs).toBe(50);
    expect((updatedFormBag.uischema.elements[2] as PasswordRequirementsElement).options?.id)
      .toBe('password-authenticator--list');
    expect(updatedFormBag.uischema.elements[3].type).toBe('HiddenInput');
    expect((updatedFormBag.uischema.elements[3] as HiddenInputElement).options.value)
      .toBe('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options.inputMeta.name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options.attributes?.autocomplete)
      .toBe('new-password');
    expect((updatedFormBag.uischema.elements[5] as FieldElement).options.inputMeta.name)
      .toBe('confirmPassword');
    expect((updatedFormBag.uischema.elements[5] as FieldElement).options.attributes?.autocomplete)
      .toBe('new-password');
    expect(updatedFormBag.uischema.elements[6]?.type).toBe('PasswordMatches');
    expect((updatedFormBag.uischema.elements[6] as PasswordMatchesElement)
      .options?.validationDelayMs).toBe(50);
    expect((updatedFormBag.uischema.elements[7] as ButtonElement).label).toBe('password.expired.submit');
    expect((updatedFormBag.uischema.elements[7] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[7] as ButtonElement).options.step)
      .toBe('reenroll-authenticator-warning');
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
    const mockMessage = 'When your password is locked, you cannot access the account';
    transaction.messages = [{
      message: mockMessage,
      class: 'INFO',
      i18n: { key: 'some.mock.key' },
    }];
    const updatedFormBag = transformExpiredPasswordWarningAuthenticator({
      transaction,
      formBag,
      widgetProps,
    });

    // Verify added elements
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(8);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.expiring.soon');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe(mockMessage);
    expect(updatedFormBag.uischema.elements[2]?.type).toBe('PasswordRequirements');
    expect((updatedFormBag.uischema.elements[2] as PasswordRequirementsElement)
      .options?.userInfo?.identifier).toBe('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[2] as PasswordRequirementsElement).options?.header)
      .toBe('password.complexity.requirements.header');
    expect((updatedFormBag.uischema.elements[2] as PasswordRequirementsElement).options?.settings)
      .toEqual({ complexity: {} });
    expect((updatedFormBag.uischema.elements[2] as PasswordRequirementsElement)
      .options?.validationDelayMs).toBe(50);
    expect((updatedFormBag.uischema.elements[2] as PasswordRequirementsElement).options?.id)
      .toBe('password-authenticator--list');
    expect(updatedFormBag.uischema.elements[3].type).toBe('HiddenInput');
    expect((updatedFormBag.uischema.elements[3] as HiddenInputElement).options.value)
      .toBe('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options.inputMeta.name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options.attributes?.autocomplete)
      .toBe('new-password');
    expect((updatedFormBag.uischema.elements[5] as FieldElement).options.inputMeta.name)
      .toBe('confirmPassword');
    expect((updatedFormBag.uischema.elements[5] as FieldElement).options.attributes?.autocomplete)
      .toBe('new-password');
    expect(updatedFormBag.uischema.elements[6]?.type).toBe('PasswordMatches');
    expect((updatedFormBag.uischema.elements[6] as PasswordMatchesElement)
      .options?.validationDelayMs).toBe(50);
    expect((updatedFormBag.uischema.elements[7] as ButtonElement).label).toBe('password.expired.submit');
    expect((updatedFormBag.uischema.elements[7] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[7] as ButtonElement).options.step)
      .toBe('reenroll-authenticator-warning');
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
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(8);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.expiring.soon');
    expect(updatedFormBag.uischema.elements[1]?.type).toBe('PasswordRequirements');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.userInfo?.identifier).toBe('someuser@noemail.com');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.header)
      .toBe('password.complexity.requirements.header');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.settings)
      .toEqual({ complexity: {} });
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
      .toBe('reenroll-authenticator-warning');
    expect((updatedFormBag.uischema.elements[7] as LinkElement).options.label)
      .toBe('password.expiring.later');
    expect((updatedFormBag.uischema.elements[7] as LinkElement).options.step)
      .toBe('skip');
  });
});
