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

import { IdxContext } from '@okta/okta-auth-js';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  FormBag,
  UISchemaLayoutType,
  WidgetProps,
} from 'src/types';

import { transformOktaVerifyEnrollPoll } from './transformOktaVerifyEnrollPoll';

describe('TransformOktaVerifyEnrollPoll Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  let widgetProps: WidgetProps;

  beforeEach(() => {
    transaction.availableSteps = [];
    widgetProps = { authClient: { idx: { proceed: jest.fn() } } } as unknown as WidgetProps;
    formBag = {
      dataSchema: {},
      schema: {},
      uischema: {
        type: UISchemaLayoutType.VERTICAL,
        elements: [],
      },
      data: {},
    };
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return a channel selection formBag when sms is selected channel with canResend = true', () => {
    transaction.availableSteps = [{ name: 'resend' }];
    transaction.nextStep = {
      name: '',
      canResend: true,
    };
    transaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: {
            selectedChannel: 'sms',
            phoneNumber: '+14215551262',
          },
        },
      },
    } as unknown as IdxContext;

    const updatedFormBag = transformOktaVerifyEnrollPoll({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should return a channel selection formBag when email is selected channel and canResend = true', () => {
    transaction.availableSteps = [{ name: 'resend' }];
    transaction.nextStep = {
      name: '',
      canResend: true,
    };
    transaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: {
            selectedChannel: 'email',
            email: 'noreply@noemail.com',
          },
        },
      },
    } as unknown as IdxContext;

    const updatedFormBag = transformOktaVerifyEnrollPoll({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add Stepper elements when selectedChannel is qrcode and canResend = true', () => {
    transaction.availableSteps = [{ name: 'resend' }];
    transaction.nextStep = {
      name: '',
      canResend: true,
    };
    transaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: {
            selectedChannel: 'qrcode',
            qrcode: { href: '', method: '', type: '' },
          },
        },
      },
    } as unknown as IdxContext;

    const updatedFormBag = transformOktaVerifyEnrollPoll({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
  });
});
