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

import { IDX_STEP } from '../../constants';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  ListElement,
  QRCodeElement,
  ReminderElement,
  StepperLayout,
  TextWithHtmlElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';
import { loc } from '../../util';

const STEPS = {
  QR_POLLING: 0,
  EMAIL_POLLING: 1,
  SMS_POLLING: 2,
};

const REMINDER_CHANNELS = ['sms', 'email'];
const CHANNEL_TO_CTA_KEY: { [channel: string]: string } = {
  email: 'oie.enroll.okta_verify.email.notReceived',
  sms: 'oie.enroll.okta_verify.sms.notReceived',
};

export const getTitleKey = (selectedChannel?: string): string => {
  switch (selectedChannel) {
    case 'email':
      return 'oie.enroll.okta_verify.setup.email.title';
    case 'sms':
      return 'oie.enroll.okta_verify.setup.sms.title';
    default:
      return 'oie.enroll.okta_verify.setup.title';
  }
};

export const switchChannelButton = (
  label: string,
): TextWithHtmlElement => ({
  type: 'TextWithHtml',
  options: {
    content: loc(label, 'login'),
    contentClassname: 'switch-channel-link',
    step: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
    stepToRender: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
  },
});

export const transformOktaVerifyEnrollPoll: IdxStepTransformer = ({ transaction, formBag }) => {
  const { context, availableSteps } = transaction;
  const { uischema } = formBag;

  const authenticator = context.currentAuthenticator.value;
  // @ts-ignore OKTA-496373 - missing props from interface
  const { selectedChannel, phoneNumber = '', email = '' } = authenticator.contextualData;

  let reminder: ReminderElement | undefined;
  const resendStep = availableSteps?.find(({ name }) => name?.endsWith('resend'));
  if (transaction!.nextStep!.canResend
    && selectedChannel
    && REMINDER_CHANNELS.includes(selectedChannel) && resendStep) {
    const { name } = resendStep;
    reminder = {
      type: 'Reminder',
      options: {
        content: loc(CHANNEL_TO_CTA_KEY[selectedChannel], 'login'),
        contentHasHtml: true,
        step: name,
        isActionStep: true,
        actionParams: { resend: true },
        contentClassname: 'resend-link',
      },
    };
  }

  const title = {
    type: 'Title',
    options: {
      content: loc(getTitleKey(selectedChannel), 'login'),
    },
  };

  const stepper: StepperLayout = {
    type: UISchemaLayoutType.STEPPER,
    elements: [
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          ...(reminder ? [reminder] : []),
          title,
          {
            type: 'List',
            options: {
              items: [
                loc('oie.enroll.okta_verify.qrcode.step1', 'login'),
                loc('oie.enroll.okta_verify.qrcode.step2', 'login'),
                loc('oie.enroll.okta_verify.qrcode.step3', 'login'),
              ],
              type: 'ordered',
            },
          } as ListElement,
          {
            type: 'QRCode',
            options: {
              data: authenticator.contextualData?.qrcode?.href,
            },
          } as QRCodeElement,
          {
            type: 'Button',
            label: loc('enroll.totp.cannotScan', 'login'),
            options: {
              type: ButtonType.BUTTON,
              variant: 'secondary',
              ariaLabel: loc('enroll.totp.aria.cannotScan', 'login'),
              step: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
              stepToRender: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
            },
          } as ButtonElement,
        ],
      } as UISchemaLayout,
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          ...(reminder ? [reminder] : []),
          title,
          {
            type: 'Description',
            options: {
              content: loc('oie.enroll.okta_verify.email.info', 'login', [email]),
            },
          } as DescriptionElement,
          switchChannelButton('oie.enroll.okta_verify.switch.channel.link.text'),
        ],
      },
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          ...(reminder ? [reminder] : []),
          title,
          {
            type: 'Description',
            options: {
              content: loc('oie.enroll.okta_verify.sms.info', 'login', [phoneNumber]),
            },
          } as DescriptionElement,
          switchChannelButton('oie.enroll.okta_verify.switch.channel.link.text'),
        ],
      },
    ],
    options: {
      defaultStepIndex: () => {
        if (selectedChannel === 'email') {
          return STEPS.EMAIL_POLLING;
        }

        if (selectedChannel === 'sms') {
          return STEPS.SMS_POLLING;
        }

        return STEPS.QR_POLLING;
      },
    },
  };

  uischema.elements = [stepper];

  return formBag;
};
