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
import { IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  FieldElement,
  WidgetProps,
} from 'src/types';

import { transformEnrollProfile } from './transformEnrollProfile';

describe('Enroll Profile Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;
  beforeEach(() => {
    formBag.uischema.elements = [
      { type: 'Field', options: { inputMeta: { name: 'userProfile.firstName' } } } as FieldElement,
      { type: 'Field', options: { inputMeta: { name: 'userProfile.lastName' } } } as FieldElement,
      { type: 'Field', options: { inputMeta: { name: 'userProfile.email' } } } as FieldElement,
    ];
    transaction.nextStep = {
      name: '',
    };
    widgetProps = {};
  });

  it('should only add title and submit button when select-identify doesnt exist in available steps '
    + 'and passcode element doesnt exist in schema', () => {
    const updatedFormBag = transformEnrollProfile({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add password requirements along with title, and submit button when passcode exists but password settings are empty', () => {
    formBag.uischema.elements.push({
      type: 'Field',
      label: 'Password',
      options: {
        inputMeta: { name: 'credentials.passcode', secret: true },
      },
    } as FieldElement);
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          settings: {},
        } as unknown as IdxAuthenticator,
      },
    };
    const mockUserInfo = {
      identifier: 'testuser@okta.com',
      profile: { firstName: 'test', lastName: 'user' },
    };
    transaction.context.user = {
      type: 'object',
      value: mockUserInfo,
    };

    const updatedFormBag = transformEnrollProfile({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add password requirements along with title, and submit button when passcode and password settings exists', () => {
    formBag.uischema.elements.push({
      type: 'Field',
      label: 'Password',
      options: {
        inputMeta: { name: 'credentials.passcode', secret: true },
      },
    } as FieldElement);
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          settings: { complexity: { minNumber: 1, minSymbol: 1 } },
        } as unknown as IdxAuthenticator,
      },
    };
    const mockUserInfo = {
      identifier: 'testuser@okta.com',
      profile: { firstName: 'test', lastName: 'user' },
    };
    transaction.context.user = {
      type: 'object',
      value: mockUserInfo,
    };

    const updatedFormBag = transformEnrollProfile({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add link to log in when select-identify step exists in remediation', () => {
    transaction.availableSteps = [{
      name: IDX_STEP.SELECT_IDENTIFY,
      action: jest.fn(),
    }];

    const updatedFormBag = transformEnrollProfile({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect(updatedFormBag).toMatchSnapshot();
  });
});
