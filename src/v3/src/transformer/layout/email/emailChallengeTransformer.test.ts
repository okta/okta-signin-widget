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
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  FieldElement,
  FormBag,
  WidgetProps,
} from 'src/types';

import { transformEmailChallenge } from '.';

describe('EmailChallengeTransformer Tests', () => {
  const redactedEmail = 'fxxxe@xxx.com';
  const transaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {};
  let formBag: FormBag;

  beforeEach(() => {
    formBag = getStubFormBag();
    formBag.uischema.elements = [
      { type: 'Field', options: { inputMeta: { name: 'credentials.passcode' } } } as FieldElement,
    ];
  });

  it('should create email challenge UI elements when resend code is available', () => {
    transaction.nextStep = {
      name: '',
      canResend: true,
      relatesTo: {
        value: {
          profile: {
            email: redactedEmail,
          },
        } as unknown as IdxAuthenticator,
      },
    };
    transaction.availableSteps = [{ name: 'resend', action: jest.fn() }];
    const updatedFormBag = transformEmailChallenge({
      transaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should create email challenge UI elements when profile email is NOT available', () => {
    transaction.nextStep = {
      name: 'mock-step',
      canResend: true,
      relatesTo: {
        value: {} as IdxAuthenticator,
      },
    };
    transaction.availableSteps = [{ name: 'resend', action: jest.fn() }];
    const updatedFormBag = transformEmailChallenge({
      transaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should create email challenge UI elements when resend code is NOT available', () => {
    transaction.availableSteps = [];
    transaction.nextStep = {
      name: 'mock-step',
      relatesTo: {
        value: {
          profile: {
            email: redactedEmail,
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformEmailChallenge({
      transaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
  });
});
