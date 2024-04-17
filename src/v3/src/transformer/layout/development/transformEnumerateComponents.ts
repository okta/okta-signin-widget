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

import { WindowsStoreIcon } from 'src/components/Icon';
import {
  AppIcon,
  DeviceIcon,
  LocationIcon,
} from 'src/components/Images';
import { AUTHENTICATOR_KEY } from 'src/constants';

import {
  AuthenticatorButtonListElement,
  ButtonElement,
  ButtonType,
  DescriptionElement,
  DividerElement,
  FieldElement,
  HeadingElement,
  IdentifierContainerElement,
  IdxStepTransformer,
  ImageLinkElement,
  ImageWithTextElement,
  InfoboxElement,
  LaunchAuthenticatorButtonElement,
  LinkElement,
  ListElement,
  OpenOktaVerifyFPButtonElement,
  PasswordMatchesElement,
  PasswordRequirementsElement,
  QRCodeElement,
  ReminderElement,
  SpinnerElement,
  TextWithActionLinkElement,
  TitleElement,
} from '../../../types';

/**
 * Special transformer that places UI elements in a single view for testing and demoing components.
 */
export const transformEnumerateComponents: IdxStepTransformer = ({
  formBag,
}) => {
  const { uischema, dataSchema, data } = formBag;

  const reminderElement: ReminderElement = {
    type: 'Reminder',
    options: {
      step: '',
      content: 'Reminder content',
      timeout: 0,
      buttonText: 'Resend',
    },
  };
  uischema.elements.push(reminderElement);

  const infoBox: InfoboxElement = {
    type: 'InfoBox',
    options: {
      message: {
        message: 'Infobox with widget message',
      },
      class: 'INFO',
    },
  };
  uischema.elements.push(infoBox);

  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: 'Title' },
  };
  uischema.elements.push(titleElement);

  const subtitleElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: 'Subtitle',
    },
  };
  uischema.elements.push(subtitleElement);

  const inputTextElement: FieldElement = {
    type: 'Field',
    key: 'inputTextElement',
    label: 'Required Text Field',
    options: {
      type: 'string',
      inputMeta: {
        name: 'input.text',
        required: true,
      },
    },
  };
  uischema.elements.push(inputTextElement);

  const inputTextOptionalElement: FieldElement = {
    type: 'Field',
    key: 'inputTextOptionalElement',
    label: 'Optional Text Field',
    options: {
      type: 'string',
      inputMeta: {
        name: 'input.textOptional',
        required: false,
      },
    },
  };
  uischema.elements.push(inputTextOptionalElement);

  const dividerWithText: DividerElement = {
    type: 'Divider',
    options: {
      text: 'OR',
    },
  };
  uischema.elements.push(dividerWithText);

  const errorBox: InfoboxElement = {
    type: 'InfoBox',
    options: {
      message: {
        message: 'Infobox with error message',
      },
      class: 'ERROR',
    },
  };
  uischema.elements.push(errorBox);

  const headingElement: HeadingElement = {
    type: 'Heading',
    options: {
      level: 3,
      visualLevel: 3,
      content: 'Heading 3',
    },
  };
  uischema.elements.push(headingElement);

  const descriptionElement: DescriptionElement = {
    type: 'Description',
    options: {
      content: 'Description',
    },
  };
  uischema.elements.push(descriptionElement);

  const passwordRequirements: PasswordRequirementsElement = {
    type: 'PasswordRequirements',
    options: {
      id: 'password.requirements',
      header: 'Password Requirements',
      userInfo: {
        identifier: 'user@example.com',
        profile: {
          firstName: 'User',
        },
      },
      settings: {
        complexity: {
          minLength: 4,
          minNumber: 1,
          minSymbol: 1,
          excludeUsername: true,
        },
      },
      requirements: [
        {
          ruleKey: 'minLength',
          label: 'Minimum length: 4',
        },
        {
          ruleKey: 'minNumber',
          label: 'Minimum numbers: 1',
        },
        {
          ruleKey: 'minSymbol',
          label: 'Minimum symbols: 1',
        },
        {
          ruleKey: 'excludeUsername',
          label: 'Cannot contain username',
        },
        {
          ruleKey: '',
          label: 'Should not match your previous password',
        },
      ],
      validationDelayMs: 0,
    },
  };
  uischema.elements.push(passwordRequirements);

  const inputPasswordElement: FieldElement = {
    type: 'Field',
    key: 'credentials.passcode',
    label: 'Required Password Field',
    options: {
      type: 'string',
      inputMeta: {
        secret: true,
        name: 'credentials.passcode',
        required: true,
      },
    },
  };
  uischema.elements.push(inputPasswordElement);
  data['credentials.passcode'] = 'a';
  const confirmPassword: FieldElement = {
    type: 'Field',
    key: 'confirmPassword',
    label: 'Confirm Password Field',
    options: {
      type: 'string',
      inputMeta: {
        secret: true,
        name: 'confirmPassword',
        required: true,
      },
    },
  };
  uischema.elements.push(confirmPassword);
  data.confirmPassword = 'a';

  const passwordMatches: PasswordMatchesElement = {
    type: 'PasswordMatches',
    options: {
      validationDelayMs: 0,
    },
  };
  uischema.elements.push(passwordMatches);

  const divider: DividerElement = {
    type: 'Divider',
  };
  uischema.elements.push(divider);

  const phoneNumberElement: FieldElement = {
    type: 'Field',
    key: 'inputPhoneElement',
    label: 'Phone Field',
    options: {
      type: 'string',
      inputMeta: {
        name: 'input.phoneNumber',
      },
    },
  };
  uischema.elements.push(phoneNumberElement);
  dataSchema['input.phoneNumber'] = {};

  const checkboxElement: FieldElement = {
    type: 'Field',
    key: 'checkboxElement',
    label: 'Checkbox',
    options: {
      inputMeta: {
        name: 'checkbox',
        type: 'checkbox',
      },
    },
  };
  uischema.elements.push(checkboxElement);

  const radioElement: FieldElement = {
    type: 'Field',
    key: 'radioElement',
    label: 'Radio',
    options: {
      inputMeta: {
        name: 'radio',
        type: 'radio',
        options: [
          {
            value: 'option1',
            label: 'Option 1',
          },
          {
            value: 'option2',
            label: 'Option 2',
          },
        ],
      },
    },
  };
  uischema.elements.push(radioElement);

  const authenticatorButtonList: AuthenticatorButtonListElement = {
    type: 'AuthenticatorButtonList',
    options: {
      buttons: [
        {
          type: 'AuthenticatorButton',
          label: 'Authenticator Button 1 with long description text',
          options: {
            step: '',
            type: ButtonType.BUTTON,
            key: AUTHENTICATOR_KEY.PHONE,
            ctaLabel: 'Call-to-action',
            Icon: '',
          },
        },
        {
          type: 'AuthenticatorButton',
          label: 'Authenticator Button 2',
          options: {
            step: '',
            type: ButtonType.BUTTON,
            key: AUTHENTICATOR_KEY.OV,
            ctaLabel: 'Call-to-action',
            description: 'Description with long description text, long enough to go to a second line',
            usageDescription: 'Usage description text',
          },
        },
        {
          type: 'AuthenticatorButton',
          label: 'Authenticator Button 3 with Phone Nickname',
          options: {
            step: '',
            type: ButtonType.BUTTON,
            key: AUTHENTICATOR_KEY.PHONE,
            ctaLabel: 'Call-to-action',
            description: '555-615-8855',
            nickname: 'mobile phone',
            Icon: '',
          },
        },
        {
          type: 'AuthenticatorButton',
          label: 'Authenticator Button 4 with extra long Phone Nickname',
          options: {
            step: '',
            type: ButtonType.BUTTON,
            key: AUTHENTICATOR_KEY.PHONE,
            ctaLabel: 'Call-to-action',
            description: '555-615-8855',
            nickname: 'This is an extra long nickname that should display an ellipsis in the UI because of how extremely long it is',
            Icon: '',
          },
        },
        {
          type: 'AuthenticatorButton',
          label: 'Authenticator Button 5 for Enroll',
          options: {
            step: '',
            type: ButtonType.BUTTON,
            key: AUTHENTICATOR_KEY.CUSTOM_APP,
            ctaLabel: 'Set up',
            isEnroll: true,
          },
        },
        {
          type: 'AuthenticatorButton',
          label: 'Authenticator Button 6 for Additional Enroll',
          options: {
            step: '',
            type: ButtonType.BUTTON,
            key: AUTHENTICATOR_KEY.WEBAUTHN,
            ctaLabel: 'Set up another',
            isEnroll: true,
            isAdditionalEnroll: true,
          },
        },
      ],
      dataSe: 'authenticator-button-list',
    },
  };
  uischema.elements.push(authenticatorButtonList);

  const launchAuthenticatorButton: LaunchAuthenticatorButtonElement = {
    type: 'LaunchAuthenticatorButton',
    options: {
      step: '',
    },
    translations: [{
      name: 'label',
      i18nKey: '',
      value: 'Launch Authenticator button with long name and icon',
    }],
  };
  uischema.elements.push(launchAuthenticatorButton);

  const openOktaVerifyFPButton: OpenOktaVerifyFPButtonElement = {
    type: 'OpenOktaVerifyFPButton',
    options: {
      step: '',
    },
  };
  uischema.elements.push(openOktaVerifyFPButton);

  const secondaryButton: ButtonElement = {
    type: 'Button',
    label: 'Secondary Button',
    options: {
      step: '',
      type: ButtonType.BUTTON,
      variant: 'secondary',
    },
  };
  uischema.elements.push(secondaryButton);

  const floatingButton: ButtonElement = {
    type: 'Button',
    label: 'Floating Button',
    options: {
      step: '',
      type: ButtonType.BUTTON,
      variant: 'floating',
    },
  };
  uischema.elements.push(floatingButton);

  uischema.elements.push(divider);

  const link: LinkElement = {
    type: 'Link',
    options: {
      step: '',
      label: 'Link',
    },
  };
  uischema.elements.push(link);

  const list: ListElement = {
    type: 'List',
    options: {
      items: [
        'List item 1',
        'List item 2',
      ],
      type: 'ul',
      description: 'List description',
    },
  };
  uischema.elements.push(list);

  const qrCode: QRCodeElement = {
    type: 'QRCode',
    options: {
      data: 'data:image/png;base64,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',
    },
  };
  uischema.elements.push(qrCode);

  const spinner: SpinnerElement = {
    type: 'Spinner',
  };
  uischema.elements.push(spinner);

  const textWithActionLink: TextWithActionLinkElement = {
    type: 'TextWithActionLink',
    options: {
      step: '',
      content: 'Text with <a href="#" class="text-with-action-link">action link</a>',
      contentClassname: 'text-with-action-link',
    },
  };
  uischema.elements.push(textWithActionLink);

  uischema.elements.push(divider);

  const appImageWithText: ImageWithTextElement = {
    type: 'ImageWithText',
    options: {
      id: 'image.withText',
      SVGIcon: AppIcon,
      textContent: 'Application',
    },
  };
  uischema.elements.push(appImageWithText);

  const deviceImageWithText: ImageWithTextElement = {
    type: 'ImageWithText',
    options: {
      id: 'image.withText',
      SVGIcon: DeviceIcon,
      textContent: 'Device',
    },
  };
  uischema.elements.push(deviceImageWithText);

  const locationImageWithText: ImageWithTextElement = {
    type: 'ImageWithText',
    options: {
      id: 'image.withText',
      SVGIcon: LocationIcon,
      textContent: 'Location',
    },
  };
  uischema.elements.push(locationImageWithText);

  const identifierElement: IdentifierContainerElement = {
    type: 'IdentifierContainer',
    options: { identifier: 'User' },
  };
  uischema.elements.push(identifierElement);

  const ImageLink: ImageLinkElement = {
    type: 'ImageLink',
    options: {
      id: 'ImageLink',
      dataSe: 'app-store-link',
      href: 'Download url',
      altText: 'Alt text',
      alignment: 'center',
      svgIcon: WindowsStoreIcon,
      marginBlockStart: '20px',
    },
  };
  uischema.elements.push(ImageLink);

  return formBag;
};
