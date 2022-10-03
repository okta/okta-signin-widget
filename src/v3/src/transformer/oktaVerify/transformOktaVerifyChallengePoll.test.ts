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
import { WidgetProps } from 'src/types';

import { transformOktaVerifyChallengePoll } from './transformOktaVerifyChallengePoll';

describe('Transform Okta Verify Challenge Poll Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  const widgetProps: WidgetProps = {};

  beforeEach(() => {
    formBag.uischema.elements = [];
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          methods: [{ type: 'push' }],
        } as IdxAuthenticator,
      },
    };
  });

  it('should not update formBag when there are no selected authenticator methods', () => {
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          methods: [],
        } as unknown as IdxAuthenticator,
      },
    };
    expect(transformOktaVerifyChallengePoll({ transaction, formBag, widgetProps }))
      .toEqual(formBag);
  });

  it('should not update formBag when selected authenticator method is unrecognized', () => {
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          methods: [{ type: 'fake' }],
        } as IdxAuthenticator,
      },
    };
    expect(transformOktaVerifyChallengePoll({ transaction, formBag, widgetProps }))
      .toEqual(formBag);
  });

  it('should transform elements when method type is standard push only', () => {
    const updatedFormBag = transformOktaVerifyChallengePoll({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should transform elements when method type is push and '
    + 'has enhanced security with resend avaialable', () => {
    transaction.availableSteps = [{ name: 'resend' }];
    const correctAnswer = '42';
    transaction.nextStep = {
      ...transaction.nextStep,
      canResend: true,
      relatesTo: {
        value: {
          methods: [{ type: 'push' }],
          contextualData: {
            // @ts-ignore OKTA-496373 correctAnswer is missing from interface
            correctAnswer,
          },
        },
      },
    };
    const updatedFormBag = transformOktaVerifyChallengePoll({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should transform elements when method type is push and '
    + 'has enhanced security when resend is unavailable', () => {
    transaction.availableSteps = [];
    const correctAnswer = '42';
    transaction.nextStep = {
      ...transaction.nextStep,
      relatesTo: {
        value: {
          methods: [{ type: 'push' }],
          contextualData: {
            // @ts-ignore OKTA-496373 correctAnswer is missing from interface
            correctAnswer,
          },
        },
      },
    };
    const updatedFormBag = transformOktaVerifyChallengePoll({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag).toMatchSnapshot();
  });
});
