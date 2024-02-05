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
  DescriptionElement,
  ListElement,
  QRCodeElement,
  ReminderElement,
  StepperLayout,
  TextWithActionLinkElement,
  TitleElement,
  UISchemaLayout,
  WidgetProps,
} from 'src/types';

import { transformOktaVerifyEnrollPoll } from './transformOktaVerifyEnrollPoll';

describe('TransformOktaVerifyEnrollPoll Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;

  beforeEach(() => {
    transaction.availableSteps = [];
    widgetProps = { authClient: { idx: { proceed: jest.fn() } } } as unknown as WidgetProps;
    formBag.uischema.elements = [];
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
            qrcode: { href: '#mockQrCode' },
          },
        },
      },
    } as unknown as IdxContext;

    const updatedFormBag = transformOktaVerifyEnrollPoll({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    const [stepperLayout] = updatedFormBag.uischema.elements;
    const [layoutOne, layoutTwo, layoutThree] = (stepperLayout as StepperLayout).elements;

    expect(layoutOne.elements.length).toBe(5);
    expect((layoutOne.elements[0] as ReminderElement).options.content)
      .toBe('oie.enroll.okta_verify.sms.notReceived');
    expect((layoutOne.elements[0] as ReminderElement).options.contentClassname)
      .toBe('resend-link');
    expect((layoutOne.elements[0] as ReminderElement).options.contentHasHtml)
      .toBe(true);
    expect((layoutOne.elements[0] as ReminderElement).options.isActionStep)
      .toBe(true);
    expect((layoutOne.elements[0] as ReminderElement).options.step)
      .toBe('resend');
    expect((layoutOne.elements[1] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.sms.title');
    expect(layoutOne.elements[2].type)
      .toBe('List');
    expect((layoutOne.elements[2] as ListElement).options.type)
      .toBe('ol');
    expect((layoutOne.elements[2] as ListElement).options.items)
      .toEqual([
        'oie.enroll.okta_verify.qrcode.step1',
        'oie.enroll.okta_verify.qrcode.step2',
        'oie.enroll.okta_verify.qrcode.step3',
      ]);
    expect(layoutOne.elements[3].type).toBe('QRCode');
    expect((layoutOne.elements[3] as QRCodeElement).options.data)
      .toBe('#mockQrCode');
    expect((layoutOne.elements[4] as ButtonElement).label)
      .toBe('enroll.totp.cannotScan');
    expect((layoutOne.elements[4] as ButtonElement).options.ariaLabel)
      .toBe('enroll.totp.aria.cannotScan');
    expect((layoutOne.elements[4] as ButtonElement).options.step)
      .toBe('select-enrollment-channel');
    expect((layoutOne.elements[4] as ButtonElement).options.stepToRender)
      .toBe('select-enrollment-channel');

    expect(layoutTwo.elements.length).toBe(4);
    expect((layoutTwo.elements[0] as ReminderElement).options.content)
      .toBe('oie.enroll.okta_verify.sms.notReceived');
    expect((layoutTwo.elements[0] as ReminderElement).options.contentClassname)
      .toBe('resend-link');
    expect((layoutTwo.elements[0] as ReminderElement).options.contentHasHtml)
      .toBe(true);
    expect((layoutTwo.elements[0] as ReminderElement).options.isActionStep)
      .toBe(true);
    expect((layoutTwo.elements[0] as ReminderElement).options.step)
      .toBe('resend');
    expect((layoutTwo.elements[1] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.sms.title');
    expect((layoutTwo.elements[2] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.email.info');
    expect(layoutTwo.elements[3].type).toBe('TextWithActionLink');
    expect((layoutTwo.elements[3] as TextWithActionLinkElement).options.content)
      .toBe('oie.enroll.okta_verify.switch.channel.link.text');
    expect((layoutTwo.elements[3] as TextWithActionLinkElement).options.contentClassname)
      .toBe('switch-channel-link');
    expect((layoutTwo.elements[3] as TextWithActionLinkElement).options.step)
      .toBe('select-enrollment-channel');
    expect((layoutTwo.elements[3] as TextWithActionLinkElement).options.stepToRender)
      .toBe('select-enrollment-channel');

    expect(layoutThree.elements.length).toBe(4);
    expect((layoutThree.elements[0] as ReminderElement).options.content)
      .toBe('oie.enroll.okta_verify.sms.notReceived');
    expect((layoutThree.elements[0] as ReminderElement).options.contentClassname)
      .toBe('resend-link');
    expect((layoutThree.elements[0] as ReminderElement).options.contentHasHtml)
      .toBe(true);
    expect((layoutThree.elements[0] as ReminderElement).options.isActionStep)
      .toBe(true);
    expect((layoutThree.elements[0] as ReminderElement).options.step)
      .toBe('resend');
    expect((layoutThree.elements[1] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.sms.title');
    expect((layoutThree.elements[2] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.sms.info');
    expect(layoutThree.elements[3].type).toBe('TextWithActionLink');
    expect((layoutThree.elements[3] as TextWithActionLinkElement).options.content)
      .toBe('oie.enroll.okta_verify.switch.channel.link.text');
    expect((layoutThree.elements[3] as TextWithActionLinkElement).options.contentClassname)
      .toBe('switch-channel-link');
    expect((layoutThree.elements[3] as TextWithActionLinkElement).options.step)
      .toBe('select-enrollment-channel');
    expect((layoutThree.elements[3] as TextWithActionLinkElement).options.stepToRender)
      .toBe('select-enrollment-channel');
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
            qrcode: { href: '#mockQrCode' },
          },
        },
      },
    } as unknown as IdxContext;

    const updatedFormBag = transformOktaVerifyEnrollPoll({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    const [stepperLayout] = updatedFormBag.uischema.elements;
    const [layoutOne, layoutTwo, layoutThree] = (stepperLayout as StepperLayout).elements;

    expect(layoutOne.elements.length).toBe(5);
    expect((layoutOne.elements[0] as ReminderElement).options.content)
      .toBe('oie.enroll.okta_verify.email.notReceived');
    expect((layoutOne.elements[0] as ReminderElement).options.contentClassname)
      .toBe('resend-link');
    expect((layoutOne.elements[0] as ReminderElement).options.contentHasHtml)
      .toBe(true);
    expect((layoutOne.elements[0] as ReminderElement).options.isActionStep)
      .toBe(true);
    expect((layoutOne.elements[0] as ReminderElement).options.step)
      .toBe('resend');
    expect((layoutOne.elements[1] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.email.title');
    expect(layoutOne.elements[2].type)
      .toBe('List');
    expect((layoutOne.elements[2] as ListElement).options.type)
      .toBe('ol');
    expect((layoutOne.elements[2] as ListElement).options.items)
      .toEqual([
        'oie.enroll.okta_verify.qrcode.step1',
        'oie.enroll.okta_verify.qrcode.step2',
        'oie.enroll.okta_verify.qrcode.step3',
      ]);
    expect(layoutOne.elements[3].type).toBe('QRCode');
    expect((layoutOne.elements[3] as QRCodeElement).options.data)
      .toBe('#mockQrCode');
    expect((layoutOne.elements[4] as ButtonElement).label)
      .toBe('enroll.totp.cannotScan');
    expect((layoutOne.elements[4] as ButtonElement).options.ariaLabel)
      .toBe('enroll.totp.aria.cannotScan');
    expect((layoutOne.elements[4] as ButtonElement).options.step)
      .toBe('select-enrollment-channel');
    expect((layoutOne.elements[4] as ButtonElement).options.stepToRender)
      .toBe('select-enrollment-channel');

    expect(layoutTwo.elements.length).toBe(4);
    expect((layoutTwo.elements[0] as ReminderElement).options.content)
      .toBe('oie.enroll.okta_verify.email.notReceived');
    expect((layoutTwo.elements[0] as ReminderElement).options.contentClassname)
      .toBe('resend-link');
    expect((layoutTwo.elements[0] as ReminderElement).options.contentHasHtml)
      .toBe(true);
    expect((layoutTwo.elements[0] as ReminderElement).options.isActionStep)
      .toBe(true);
    expect((layoutTwo.elements[0] as ReminderElement).options.step)
      .toBe('resend');
    expect((layoutTwo.elements[1] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.email.title');
    expect((layoutTwo.elements[2] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.email.info');
    expect(layoutTwo.elements[3].type).toBe('TextWithActionLink');
    expect((layoutTwo.elements[3] as TextWithActionLinkElement).options.content)
      .toBe('oie.enroll.okta_verify.switch.channel.link.text');
    expect((layoutTwo.elements[3] as TextWithActionLinkElement).options.contentClassname)
      .toBe('switch-channel-link');
    expect((layoutTwo.elements[3] as TextWithActionLinkElement).options.step)
      .toBe('select-enrollment-channel');
    expect((layoutTwo.elements[3] as TextWithActionLinkElement).options.stepToRender)
      .toBe('select-enrollment-channel');

    expect(layoutThree.elements.length).toBe(4);
    expect((layoutThree.elements[0] as ReminderElement).options.content)
      .toBe('oie.enroll.okta_verify.email.notReceived');
    expect((layoutThree.elements[0] as ReminderElement).options.contentClassname)
      .toBe('resend-link');
    expect((layoutThree.elements[0] as ReminderElement).options.contentHasHtml)
      .toBe(true);
    expect((layoutThree.elements[0] as ReminderElement).options.isActionStep)
      .toBe(true);
    expect((layoutThree.elements[0] as ReminderElement).options.step)
      .toBe('resend');
    expect((layoutThree.elements[1] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.email.title');
    expect((layoutThree.elements[2] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.sms.info');
    expect(layoutThree.elements[3].type).toBe('TextWithActionLink');
    expect((layoutThree.elements[3] as TextWithActionLinkElement).options.content)
      .toBe('oie.enroll.okta_verify.switch.channel.link.text');
    expect((layoutThree.elements[3] as TextWithActionLinkElement).options.contentClassname)
      .toBe('switch-channel-link');
    expect((layoutThree.elements[3] as TextWithActionLinkElement).options.step)
      .toBe('select-enrollment-channel');
    expect((layoutThree.elements[3] as TextWithActionLinkElement).options.stepToRender)
      .toBe('select-enrollment-channel');
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
            qrcode: { href: '#mockQrCode', method: '', type: '' },
          },
        },
      },
    } as unknown as IdxContext;

    const updatedFormBag = transformOktaVerifyEnrollPoll({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    const [stepperLayout] = updatedFormBag.uischema.elements;
    const [layoutOne, layoutTwo, layoutThree] = (stepperLayout as StepperLayout).elements;

    expect(layoutOne.elements.length).toBe(4);
    expect((layoutOne.elements[0] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.title');
    expect(layoutOne.elements[1].type)
      .toBe('List');
    expect((layoutOne.elements[1] as ListElement).options.type)
      .toBe('ol');
    expect((layoutOne.elements[1] as ListElement).options.items)
      .toEqual([
        'oie.enroll.okta_verify.qrcode.step1',
        'oie.enroll.okta_verify.qrcode.step2',
        'oie.enroll.okta_verify.qrcode.step3',
      ]);
    expect(layoutOne.elements[2].type).toBe('QRCode');
    expect((layoutOne.elements[2] as QRCodeElement).options.data)
      .toBe('#mockQrCode');
    expect((layoutOne.elements[3] as ButtonElement).label)
      .toBe('enroll.totp.cannotScan');
    expect((layoutOne.elements[3] as ButtonElement).options.ariaLabel)
      .toBe('enroll.totp.aria.cannotScan');
    expect((layoutOne.elements[3] as ButtonElement).options.step)
      .toBe('select-enrollment-channel');
    expect((layoutOne.elements[3] as ButtonElement).options.stepToRender)
      .toBe('select-enrollment-channel');

    expect(layoutTwo.elements.length).toBe(3);
    expect((layoutTwo.elements[0] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.title');
    expect((layoutTwo.elements[1] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.email.info');
    expect(layoutTwo.elements[2].type).toBe('TextWithActionLink');
    expect((layoutTwo.elements[2] as TextWithActionLinkElement).options.content)
      .toBe('oie.enroll.okta_verify.switch.channel.link.text');
    expect((layoutTwo.elements[2] as TextWithActionLinkElement).options.contentClassname)
      .toBe('switch-channel-link');
    expect((layoutTwo.elements[2] as TextWithActionLinkElement).options.step)
      .toBe('select-enrollment-channel');
    expect((layoutTwo.elements[2] as TextWithActionLinkElement).options.stepToRender)
      .toBe('select-enrollment-channel');

    expect(layoutThree.elements.length).toBe(3);
    expect((layoutThree.elements[0] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.title');
    expect((layoutThree.elements[1] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.sms.info');
    expect(layoutThree.elements[2].type).toBe('TextWithActionLink');
    expect((layoutThree.elements[2] as TextWithActionLinkElement).options.content)
      .toBe('oie.enroll.okta_verify.switch.channel.link.text');
    expect((layoutThree.elements[2] as TextWithActionLinkElement).options.contentClassname)
      .toBe('switch-channel-link');
    expect((layoutThree.elements[2] as TextWithActionLinkElement).options.step)
      .toBe('select-enrollment-channel');
    expect((layoutThree.elements[2] as TextWithActionLinkElement).options.stepToRender)
      .toBe('select-enrollment-channel');
  });

  /* eslint max-len: [2, 120] */
  it('should add Stepper elements when selectedChannel is samedevice', () => {
    transaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: {
            samedevice: {
              orgUrl: 'okta.okta.com',
              downloadHref: 'https://apps.apple.com/us/app/okta-verify/id490179405',
              platform: 'ios',
            },
            selectedChannel: 'samedevice',
          },
        },
      },
    } as unknown as IdxContext;

    const updatedFormBag = transformOktaVerifyEnrollPoll({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    const [stepperLayout] = updatedFormBag.uischema.elements;
    const layoutFour = (stepperLayout as StepperLayout).elements[3];

    expect(layoutFour.elements.length).toBe(4);
    expect((layoutFour.elements[0] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.title');
    expect((layoutFour.elements[1] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.subtitle');
    expect(layoutFour.elements[2].type)
      .toBe('List');
    const listElement = layoutFour.elements[2] as ListElement;
    expect(listElement.options.type)
      .toBe('ol');
    expect(((listElement.options.items[0] as UISchemaLayout).elements[0] as DescriptionElement).options.content)
      .toBe('enroll.oda.without.account.step1');
    expect(((listElement.options.items[1] as UISchemaLayout).elements[0] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.openOv');
    expect(((listElement.options.items[2] as UISchemaLayout).elements[0] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.signInUrl');
    expect(((listElement.options.items[2] as UISchemaLayout).elements[1] as DescriptionElement).options.content)
      .toBe('<span class="strong no-translate">okta.okta.com</span>');
    expect(((listElement.options.items[2] as UISchemaLayout).elements[2] as ButtonElement).label)
      .toBe('enroll.oda.org.copyLink');
    expect(((listElement.options.items[3] as UISchemaLayout).elements[0] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.skipAuth.followInstruction');
    expect((layoutFour.elements[3] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.skipAuth.canBeClosed');
  });

  /* eslint max-len: [2, 120] */
  it('should add Stepper elements when selectedChannel is devicebootstrap', () => {
    transaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: {
            devicebootstrap: {
              platform: 'ios',
              enrolledDevices: ['testDevice1', 'device2'],
            },
            selectedChannel: 'devicebootstrap',
          },
        },
      },
    } as unknown as IdxContext;

    const updatedFormBag = transformOktaVerifyEnrollPoll({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    const [stepperLayout] = updatedFormBag.uischema.elements;
    const layoutFive = (stepperLayout as StepperLayout).elements[4];

    expect(layoutFive.elements.length).toBe(4);
    expect((layoutFive.elements[0] as TitleElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.title');
    expect((layoutFive.elements[1] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.skipAuth.subtitle');
    expect(layoutFive.elements[2].type)
      .toBe('List');
    const listElement = layoutFive.elements[2] as ListElement;
    expect(listElement.options.type)
      .toBe('ol');
    expect(((listElement.options.items[0] as UISchemaLayout).elements[0] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.skipAuth.openOv.suchAs');
    expect(((listElement.options.items[1] as UISchemaLayout).elements[0] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.skipAuth.selectAccount');
    expect(((listElement.options.items[2] as UISchemaLayout).elements[0] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.skipAuth.addAccount');
    expect(((listElement.options.items[3] as UISchemaLayout).elements[0] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.skipAuth.followInstruction');
    expect((layoutFive.elements[3] as DescriptionElement).options.content)
      .toBe('oie.enroll.okta_verify.setup.skipAuth.canBeClosed');
  });
});
