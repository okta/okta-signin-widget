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

import Util from '../../../../util/Util';
import {
  AppleStoreIcon,
  GoogleStoreIcon,
  OSXStoreIcon,
  WindowsStoreIcon,
} from '../../components/Icon';
import { IDX_STEP } from '../../constants';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  ImageLinkElement,
  ListElement,
  QRCodeElement,
  ReminderElement,
  StepperLayout,
  StepperLinkElement,
  TextWithActionLinkElement,
  TokenReplacement,
  UISchemaElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';
import { copyToClipboard, isAndroid, loc } from '../../util';

const STEPS = {
  QR_POLLING: 0,
  EMAIL_POLLING: 1,
  SMS_POLLING: 2,
  SAME_DEVICE: 3,
  DEVICE_BOOTSTRAP: 4,
  SAME_DEVICE_OV_ENROLLMENT: 5,
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
): TextWithActionLinkElement => ({
  type: 'TextWithActionLink',
  options: {
    content: loc(label, 'login'),
    contentClassname: 'switch-channel-link',
    step: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
    stepToRender: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
  },
});

export const transformOktaVerifyEnrollPoll: IdxStepTransformer = ({
  transaction,
  widgetProps,
  formBag,
}) => {
  const { context, availableSteps } = transaction;
  const { uischema } = formBag;

  const authenticator = context.currentAuthenticator.value;
  const {
    // @ts-ignore OKTA-496373 - missing props from interface
    selectedChannel, phoneNumber = '', email = '', devicebootstrap: deviceBootstrap, samedevice: sameDevice,
  } = authenticator.contextualData;

  const enrolledDevices = deviceBootstrap?.enrolledDevices || [];
  const enrolledDevice = Array.isArray(enrolledDevices) ? enrolledDevices?.[0] : enrolledDevices;
  const qrCodeHref = authenticator.contextualData?.qrcode?.href;
  let channelType = selectedChannel;
  let deviceMap: {
    setupOVUrl?: string;
    platform?: string;
    platformLC?: string;
    isDesktop?: boolean;
    securityLevel?: string,
    downloadHref?: string,
  } = {};
  let showAnotherDeviceLink = false;

  if (sameDevice && sameDevice.setupOVUrl) {
    deviceMap = sameDevice;
  } else if (deviceBootstrap && deviceBootstrap.setupOVUrl) {
    deviceMap = deviceBootstrap;
  }

  if (deviceMap.platform) {
    deviceMap.platformLC = deviceMap.platform.toLowerCase();
    deviceMap.isDesktop = !(deviceMap.platformLC === 'ios' || deviceMap.platformLC === 'android');
    channelType = 'sameDeviceOVEnrollment';
  }

  if (deviceMap.securityLevel && deviceMap.securityLevel === 'ANY') {
    showAnotherDeviceLink = true;
  }

  let backToSameOVEnrollmentLink: UISchemaLayout | undefined;
  if (showAnotherDeviceLink) {
    backToSameOVEnrollmentLink = {
      type: UISchemaLayoutType.VERTICAL,
      elements: [{
        type: 'StepperLink',
        contentType: 'footer',
        label: loc('oie.go.back', 'login'),
        options: {
          nextStepIndex: STEPS.SAME_DEVICE_OV_ENROLLMENT,
        },
      } as StepperLinkElement],
    } as UISchemaLayout;
  }

  let reminder: ReminderElement | undefined;
  const resendStep = availableSteps?.find(({ name }) => name?.endsWith('resend'));
  if (transaction!.nextStep!.canResend
    && channelType
    && REMINDER_CHANNELS.includes(channelType) && resendStep) {
    const { name } = resendStep;
    reminder = {
      type: 'Reminder',
      options: {
        content: loc(CHANNEL_TO_CTA_KEY[channelType], 'login'),
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
      content: loc(getTitleKey(channelType), 'login'),
    },
  };

  const tokenReplacement: TokenReplacement = { $1: { element: 'span', attributes: { class: 'strong no-translate' } } };

  const canBeClosed = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.enroll.okta_verify.setup.skipAuth.canBeClosed', 'login'),
    },
  } as DescriptionElement;

  const listItems: (string | UISchemaLayout)[] = [];
  const sameDeviceOVElements = [];
  const makeTextListItem = (content: string): UISchemaLayout => ({
    type: UISchemaLayoutType.VERTICAL,
    elements: [
      {
        type: 'Description',
        noMargin: true,
        options: {
          content,
        },
      } as DescriptionElement,
    ],
  });
  if (deviceMap.setupOVUrl) {
    if (deviceMap.isDesktop) {
      sameDeviceOVElements.push(
        {
          type: 'Description',
          noMargin: true,
          options: {
            content: loc(
              'oie.enroll.okta_verify.setup.customUri.prompt',
              'login',
              undefined,
              { $1: { element: 'span', attributes: { class: 'strong' } } },
            ),
          },
        } as DescriptionElement,
        {
          type: 'Description',
          noMargin: true,
          options: {
            content: loc(
              'oie.enroll.okta_verify.setup.customUri.noPrompt',
              'login',
              undefined,
              { $1: { element: 'span', attributes: { class: 'strong' } } },
            ),
          },
        } as DescriptionElement,
        {
          type: 'Description',
          noMargin: true,
          options: {
            content: loc('oie.enroll.okta_verify.setup.customUri.makeSureHaveOV', 'login'),
          },
        } as DescriptionElement,
      );
    } else {
      sameDeviceOVElements.push(
        {
          type: 'Description',
          noMargin: true,
          options: {
            content: loc(
              'oie.enroll.okta_verify.setup.customUri.makeSureHaveOVToContinue', 'login',
            ),
          },
        } as DescriptionElement,
      );
    }
    if (deviceMap.platformLC) {
      let platformSupported = true;
      let svgIcon;
      switch (deviceMap.platformLC) {
        case 'android':
          svgIcon = GoogleStoreIcon;
          break;

        case 'ios':
          svgIcon = AppleStoreIcon;
          break;

        case 'windows':
          svgIcon = WindowsStoreIcon;
          break;

        case 'osx':
          svgIcon = OSXStoreIcon;
          break;

        default:
          platformSupported = false;
      }
      if (platformSupported) {
        sameDeviceOVElements.push(
          {
            type: 'ImageLink',
            options: {
              href: deviceMap.downloadHref,
              altText: loc('enroll.oda.step3', 'login'),
              alignment: 'center',
              svgIcon,
              dataSe: 'app-store-link',
              marginBlockStart: '20px',
            },
          } as ImageLinkElement,
        );
      }
    }
    sameDeviceOVElements.push(
      {
        type: 'Description',
        noMargin: true,
        options: {
          content: loc(
            'oie.enroll.okta_verify.setup.customUri.setup',
            'login',
            undefined,
            { $1: { element: 'span', attributes: { class: 'strong' } } },
          ),
        },
      } as DescriptionElement,
    );

    if (deviceMap.setupOVUrl) {
      sameDeviceOVElements.push(
        {
          type: 'Button',
          label: loc('oie.enroll.okta_verify.setup.title', 'login'),
          options: {
            step: '',
            type: ButtonType.BUTTON,
            variant: 'primary',
            onClick: () => {
              if (isAndroid()) {
                Util.redirectWithFormGet(deviceMap.setupOVUrl);
              } else {
                window.location.assign(deviceMap.setupOVUrl!);
              }
            },
          },
        } as ButtonElement,
      );
    }

    if (showAnotherDeviceLink) {
      sameDeviceOVElements.push(
        {
          type: 'TextWithActionLink',
          options: {
            content: loc(
              deviceMap.isDesktop ? 'oie.enroll.okta_verify.setup.customUri.orOnMobile'
                : 'oie.enroll.okta_verify.setup.customUri.orMobile',
              'login',
              undefined,
              {
                $1: { element: 'a', attributes: { href: '#', class: 'orOnMobileLink' } },
              },
            ),
            contentClassname: 'orOnMobileLink',
            step: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
            actionParams: {
              'authenticator.channel': 'qrcode',
              'authenticator.id': authenticator.id,
            },
          },
        } as TextWithActionLinkElement,
      );
    }
  } else if (deviceBootstrap) {
    listItems.push(
      makeTextListItem(loc(
        'oie.enroll.okta_verify.setup.skipAuth.openOv.suchAs', 'login',
        [enrolledDevice], tokenReplacement,
      )),
      makeTextListItem(loc(
        'oie.enroll.okta_verify.setup.skipAuth.selectAccount', 'login',
      )),
      makeTextListItem(loc(
        'oie.enroll.okta_verify.setup.skipAuth.addAccount', 'login', [], tokenReplacement,
      )),
      makeTextListItem(loc(
        'oie.enroll.okta_verify.setup.skipAuth.followInstruction', 'login',
      )),
    );
  } else if (sameDevice) {
    listItems.push(
      makeTextListItem(loc(
        'enroll.oda.without.account.step1', 'login',
        [sameDevice.downloadHref], tokenReplacement,
      )),
      makeTextListItem(loc(
        'oie.enroll.okta_verify.setup.openOv', 'login',
      )),
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Description',
            noMargin: true,
            options: {
              content: loc('oie.enroll.okta_verify.setup.signInUrl', 'login'),
            },
          } as DescriptionElement,
          {
            type: 'Description',
            noMargin: true,
            options: {
              content: `<span class="strong no-translate">${sameDevice.orgUrl}</span>`,
            },
          } as DescriptionElement,
          {
            type: 'Button',
            label: loc('enroll.oda.org.copyLink', 'login'),
            options: {
              step: '',
              type: ButtonType.BUTTON,
              variant: 'secondary',
              onClick: () => copyToClipboard(sameDevice.orgUrl),
            },
          } as ButtonElement,
        ],
      } as UISchemaLayout,
      makeTextListItem(loc(
        'oie.enroll.okta_verify.setup.skipAuth.followInstruction', 'login',
      )),
    );
  } else if (qrCodeHref) {
    listItems.push(
      loc('oie.enroll.okta_verify.qrcode.step1', 'login'),
      loc('oie.enroll.okta_verify.qrcode.step2', 'login'),
      loc('oie.enroll.okta_verify.qrcode.step3', 'login'),
    );
  }

  const { features: { sameDeviceOVEnrollmentEnabled = false } = {} } = widgetProps;

  const qrCodeElements = [];
  if (qrCodeHref) {
    qrCodeElements.push({
      type: 'QRCode',
      options: {
        data: qrCodeHref,
      },
    } as QRCodeElement);

    if (sameDeviceOVEnrollmentEnabled) {
      qrCodeElements.push({
        type: 'TextWithActionLink',
        options: {
          content: loc('oie.enroll.okta_verify.switch.channel.link.text', 'login'),
          contentClassname: 'switch-channel-link',
          step: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
          stepToRender: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
          actionParams: {
            'authenticator.channel': 'qrcode',
            'authenticator.id': authenticator.id,
          },
        },
      });
    } else {
      qrCodeElements.push({
        type: 'Button',
        label: loc('enroll.totp.cannotScan', 'login'),
        options: {
          type: ButtonType.BUTTON,
          variant: 'secondary',
          ariaLabel: loc('enroll.totp.aria.cannotScan', 'login'),
          step: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
          stepToRender: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
        },
      } as ButtonElement);
    }
  }

  const stepper: StepperLayout = {
    type: UISchemaLayoutType.STEPPER,
    key: 'stepper_' + channelType,
    elements: [
      // QR code
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          ...(reminder ? [reminder] : []),
          title,
          {
            type: 'List',
            noMargin: true,
            options: {
              items: listItems,
              type: 'ol',
            },
          } as ListElement,
          ...qrCodeElements,
          ...(backToSameOVEnrollmentLink ? [backToSameOVEnrollmentLink] : []),
        ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 0 })),
      } as UISchemaLayout,
      // Email
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          ...(reminder ? [reminder] : []),
          title,
          {
            type: 'Description',
            contentType: 'subtitle',
            options: {
              content: loc('oie.enroll.okta_verify.email.info', 'login', [email]),
            },
          } as DescriptionElement,
          switchChannelButton('oie.enroll.okta_verify.switch.channel.link.text'),
        ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 1 })),
      },
      // SMS
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          ...(reminder ? [reminder] : []),
          title,
          {
            type: 'Description',
            contentType: 'subtitle',
            options: {
              content: loc('oie.enroll.okta_verify.sms.info', 'login', [phoneNumber]),
            },
          } as DescriptionElement,
          switchChannelButton('oie.enroll.okta_verify.switch.channel.link.text'),
        ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 2 })),
      },
      // Same device
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          ...(reminder ? [reminder] : []),
          title,
          {
            type: 'Description',
            contentType: 'subtitle',
            noMargin: true,
            options: {
              content: loc('oie.enroll.okta_verify.setup.subtitle', 'login'),
            },
          } as DescriptionElement,
          {
            type: 'List',
            noMargin: true,
            options: {
              items: listItems,
              type: 'ol',
            },
          } as ListElement,
          canBeClosed,
          ...(backToSameOVEnrollmentLink ? [backToSameOVEnrollmentLink] : []),
        ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 3 })),
      },
      // Device bootstrap
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          ...(reminder ? [reminder] : []),
          title,
          {
            type: 'Description',
            contentType: 'subtitle',
            noMargin: true,
            options: {
              content: loc('oie.enroll.okta_verify.setup.skipAuth.subtitle', 'login'),
            },
          } as DescriptionElement,
          {
            type: 'List',
            noMargin: true,
            options: {
              items: listItems,
              type: 'ol',
            },
          } as ListElement,
          canBeClosed,
          ...(backToSameOVEnrollmentLink ? [backToSameOVEnrollmentLink] : []),
        ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 4 })),
      },
      // Same device OV enrollment
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          title,
          ...sameDeviceOVElements,
        ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 5 })),
      },
    ],
    options: {
      defaultStepIndex: () => {
        switch (channelType) {
          case 'email':
            return STEPS.EMAIL_POLLING;
          case 'sms':
            return STEPS.SMS_POLLING;
          case 'samedevice':
            return STEPS.SAME_DEVICE;
          case 'devicebootstrap':
            return STEPS.DEVICE_BOOTSTRAP;
          case 'sameDeviceOVEnrollment':
            return STEPS.SAME_DEVICE_OV_ENROLLMENT;
          default:
            return STEPS.QR_POLLING;
        }
      },
    },
  };

  uischema.elements = [stepper];

  return formBag;
};
