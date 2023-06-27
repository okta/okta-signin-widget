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
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  FieldElement,
  TextWithActionLinkElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import * as utils from '../../util/browserUtils';
import { transformOktaVerifyChannelSelection } from './transformOktaVerifyChannelSelection';

describe('TransformOktaVerifyChannelSelection Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const prevTransaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  const widgetProps: WidgetProps = {};
  let mobileDeviceStub: jest.SpyInstance<boolean>;

  beforeEach(() => {
    formBag.uischema.elements = [
      {
        type: 'Field',
        options: {
          inputMeta: {
            name: 'authenticator.channel',
            options: [
              { value: 'qrcode', label: 'QRCode' },
              { value: 'sms', label: 'SMS' },
              { value: 'email', label: 'EMAIL' },
            ],
          },
        },
      } as FieldElement,
    ];

    mobileDeviceStub = jest.spyOn(utils, 'isAndroidOrIOS');
  });

  it('should only append (sms/email) channel options when on mobile and qrcode is the selectedChannel', () => {
    // on mobile, the data we need is on current transaction context rather than previous transaction
    prevTransaction.context = {
    } as unknown as IdxContext;
    transaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: { selectedChannel: 'qrcode' },
        },
      },
    } as unknown as IdxContext;
    mobileDeviceStub.mockReturnValue(true);

    const updatedFormBag = transformOktaVerifyChannelSelection({
      transaction, prevTransaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).label)
      .toBe('oie.enroll.okta_verify.select.channel.description');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.format)
      .toBe('radio');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.customOptions?.length)
      .toBe(2);
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('authenticator.channel');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.options?.length)
      .toBe(3);
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('oform.next');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options.step)
      .toBe('select-enrollment-channel');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[3] as TextWithActionLinkElement).options.content)
      .toBe('oie.enroll.okta_verify.switch.channel.link.text');
    expect((updatedFormBag.uischema.elements[3] as TextWithActionLinkElement)
      .options.contentClassname).toBe('switch-channel-link');
    expect((updatedFormBag.uischema.elements[3] as TextWithActionLinkElement).options.step)
      .toBe('select-enrollment-channel');
  });

  it('should only append (sms/email) channel options when on mobile and sms is the selectedChannel', () => {
    // on mobile, the data we need is on current transaction context rather than previous transaction
    prevTransaction.context = {
    } as unknown as IdxContext;
    transaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: { selectedChannel: 'sms' },
        },
      },
    } as unknown as IdxContext;
    mobileDeviceStub.mockReturnValue(true);

    const updatedFormBag = transformOktaVerifyChannelSelection({
      transaction, prevTransaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).label)
      .toBe('oie.enroll.okta_verify.select.channel.description');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.format)
      .toBe('radio');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.customOptions?.length)
      .toBe(2);
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('authenticator.channel');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.options?.length)
      .toBe(3);
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('oform.next');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options.step)
      .toBe('select-enrollment-channel');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should only append (sms/email) channel options when on mobile and email is the selectedChannel', () => {
    // on mobile, the data we need is on current transaction context rather than previous transaction
    prevTransaction.context = {
    } as unknown as IdxContext;
    transaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: { selectedChannel: 'email' },
        },
      },
    } as unknown as IdxContext;
    mobileDeviceStub.mockReturnValue(true);

    const updatedFormBag = transformOktaVerifyChannelSelection({
      transaction, prevTransaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).label)
      .toBe('oie.enroll.okta_verify.select.channel.description');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.format)
      .toBe('radio');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.customOptions?.length)
      .toBe(2);
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('authenticator.channel');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.options?.length)
      .toBe(3);
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('oform.next');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options.step)
      .toBe('select-enrollment-channel');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should only append (qrcode/email) channel options when NOT on mobile and sms is the selectedChannel', () => {
    prevTransaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: { selectedChannel: 'sms' },
        },
      },
    } as unknown as IdxContext;
    mobileDeviceStub.mockReturnValue(false);

    const updatedFormBag = transformOktaVerifyChannelSelection({
      transaction, prevTransaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.select.channel.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).label)
      .toBe('oie.enroll.okta_verify.select.channel.description');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.format)
      .toBe('radio');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.customOptions?.length)
      .toBe(2);
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('authenticator.channel');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.options?.length)
      .toBe(3);
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('oform.next');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options.step)
      .toBe('select-enrollment-channel');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should only append (qrcode/sms) channel options when NOT on mobile and email is the selectedChannel', () => {
    prevTransaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: { selectedChannel: 'email' },
        },
      },
    } as unknown as IdxContext;
    mobileDeviceStub.mockReturnValue(false);

    const updatedFormBag = transformOktaVerifyChannelSelection({
      transaction, prevTransaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.select.channel.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).label)
      .toBe('oie.enroll.okta_verify.select.channel.description');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.format)
      .toBe('radio');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.customOptions?.length)
      .toBe(2);
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('authenticator.channel');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.options?.length)
      .toBe(3);
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('oform.next');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options.step)
      .toBe('select-enrollment-channel');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should only append (sms/email) channel options when NOT on mobile and qrcode is the selectedChannel', () => {
    prevTransaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: { selectedChannel: 'qrcode' },
        },
      },
    } as unknown as IdxContext;
    mobileDeviceStub.mockReturnValue(false);

    const updatedFormBag = transformOktaVerifyChannelSelection({
      transaction, prevTransaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.select.channel.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).label)
      .toBe('oie.enroll.okta_verify.select.channel.description');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.format)
      .toBe('radio');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.customOptions?.length)
      .toBe(2);
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('authenticator.channel');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.options?.length)
      .toBe(3);
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('oform.next');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options.step)
      .toBe('select-enrollment-channel');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[3] as TextWithActionLinkElement).options.content)
      .toBe('oie.enroll.okta_verify.switch.channel.link.text');
    expect((updatedFormBag.uischema.elements[3] as TextWithActionLinkElement)
      .options.contentClassname).toBe('switch-channel-link');
    expect((updatedFormBag.uischema.elements[3] as TextWithActionLinkElement).options.step)
      .toBe('select-enrollment-channel');
  });
});
