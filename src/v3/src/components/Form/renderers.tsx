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

import { Input } from '@okta/okta-auth-js';

import { FieldElement, InputTextElement, Renderer } from '../../types';
import AuthenticatorButton from '../AuthenticatorButton';
import Button from '../Button';
import Checkbox from '../Checkbox';
import Heading from '../Heading';
import ImageWithText from '../ImageWithText';
import InfoBox from '../InfoBox';
import InformationalText from '../InformationalText';
import InputPassword from '../InputPassword';
import InputText from '../InputText';
import Link from '../Link';
import List from '../List';
import PasswordRequirements from '../PasswordRequirements';
import PhoneAuthenticator from '../PhoneAuthenticator';
import QRCode from '../QRCode';
import Radio from '../Radio';
import Redirect from '../Redirect';
import ReminderPrompt from '../ReminderPrompt';
import Select from '../Select';
import Spinner from '../Spinner';
import StepperButton from '../StepperButton';
import StepperRadio from '../StepperRadio';
import SuccessCallback from '../SuccessCallback';
import TextWithHtml from '../TextWithHtml/TextWithHtml';
import Title from '../Title';
import WebAuthNSubmitButton from '../WebAuthNSubmitButton';

/**
 * Render registry to match UISchemaElement Component with uischema
 * layout schemas and components are handled in Form component layer
 *
 * Note: the tester order of this array matters, first match found will be used as the render component.
*/
export default [
  {
    tester: ({ type }) => type === 'Reminder',
    renderer: ReminderPrompt,
  },
  {
    tester: ({ type }) => type === 'QRCode',
    renderer: QRCode,
  },
  {
    tester: ({ type }) => type === 'Link',
    renderer: Link,
  },
  {
    tester: ({ type }) => type === 'List',
    renderer: List,
  },
  {
    tester: ({ type }) => type === 'Heading',
    renderer: Heading,
  },
  {
    tester: ({ type }) => type === 'PasswordRequirements',
    renderer: PasswordRequirements,
  },
  {
    tester: ({ type }) => type === 'Spinner',
    renderer: Spinner,
  },
  {
    tester: ({ type }) => type === 'StepperButton',
    renderer: StepperButton,
  },
  {
    tester: ({ type }) => type === 'StepperRadio',
    renderer: StepperRadio,
  },
  {
    // Move non UI component to custom hook
    tester: ({ type }) => type === 'Redirect',
    renderer: Redirect,
  },
  {
    // Move non UI component to custom hook
    tester: ({ type }) => type === 'SuccessCallback',
    renderer: SuccessCallback,
  },
  {
    tester: ({ type }) => type === 'WebAuthNSubmitButton',
    renderer: WebAuthNSubmitButton,
  },
  {
    tester: (uischema: FieldElement) => {
      const {
        options: {
          inputMeta: { name } = {},
        } = {},
      } = uischema;
      return name?.endsWith('phoneNumber');
    },
    renderer: PhoneAuthenticator,
  },
  {
    tester: ({ type }) => type === 'TextWithHtml',
    renderer: TextWithHtml,
  },
  {
    tester: ({ type }) => type === 'Title',
    renderer: Title,
  },
  {
    tester: ({ type }) => type === 'Description',
    renderer: InformationalText,
  },
  {
    tester: ({ type }) => type === 'InfoBox',
    renderer: InfoBox,
  },
  {
    tester: ({
      options: {
        type: defaultType,
        inputMeta: {
          type, options, name, secret,
        } = {} as Input,
      },
    }: InputTextElement) => ((type === 'string' || defaultType === 'string') && !options && !secret)
      || (name === 'credentials.passcode' && !secret),
    renderer: InputText,
  },
  {
    tester: ({ options: { inputMeta: { secret } = {} as Input } }: FieldElement) => !!secret,
    renderer: InputPassword,
  },
  {
    tester: ({ options: { inputMeta: { type } = {} as Input } }: FieldElement) => type === 'boolean',
    renderer: Checkbox,
  },
  {
    tester: ({ type }) => type === 'AuthenticatorButton',
    renderer: AuthenticatorButton,
  },
  {
    tester: ({
      options: {
        inputMeta: { options } = {} as Input,
        format,
        customOptions,
      },
    }: FieldElement) => (Array.isArray(customOptions) || Array.isArray(options)) && format === 'radio',
    renderer: Radio,
  },
  {
    tester: ({
      options: {
        inputMeta: { options } = {} as Input,
        format,
        customOptions,
      },
    }: FieldElement) => (Array.isArray(customOptions) || Array.isArray(options)) && format === 'dropdown',
    renderer: Select,
  },
  {
    tester: ({ type }) => type === 'Button',
    renderer: Button,
  },
  {
    tester: ({ type }) => type === 'ImageWithText',
    renderer: ImageWithText,
  },
] as Renderer[];
