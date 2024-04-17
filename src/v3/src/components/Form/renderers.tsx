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

import { FieldElement, Renderer } from '../../types';
import {
  isCheckboxFieldElement,
  isInputTextFieldElement,
  isPhoneNumberElement,
  isRadioFieldElement,
  isSelectFieldElement,
} from '../../util';
import AuthenticatorButtonList from '../AuthenticatorButton';
import AutoSubmit from '../AutoSubmit';
import Button from '../Button';
import CaptchaContainer from '../CaptchaContainer';
import Checkbox from '../Checkbox';
import ChromeDtcContainer from '../ChromeDtcContainer';
import Divider from '../Divider';
import DuoWindow from '../DuoWindow';
import Heading from '../Heading';
import HiddenInput from '../HiddenInput';
import IdentifierContainer from '../IdentifierContainer';
import ImageLink from '../ImageLink';
import ImageWithText from '../ImageWithText';
import InfoBox from '../InfoBox';
import InformationalText from '../InformationalText';
import InputPassword from '../InputPassword';
import InputText from '../InputText';
import LaunchAuthenticatorButton from '../LaunchAuthenticatorButton';
import Link from '../Link';
import List from '../List';
import LoopbackProbe from '../LoopbackProbe';
import OpenOktaVerifyFPButton from '../OpenOktaVerifyFPButton';
import PasswordRequirements from '../PasswordRequirements';
import PasswordMatches from '../PasswordRequirements/PasswordMatches';
import PhoneAuthenticator from '../PhoneAuthenticator';
import PIVButton from '../PIVButton';
import QRCode from '../QRCode';
import Radio from '../Radio';
import Redirect from '../Redirect';
import ReminderPrompt from '../ReminderPrompt';
import Select from '../Select';
import Spinner from '../Spinner';
import StepperButton from '../StepperButton';
import StepperLink from '../StepperLink';
import StepperNavigator from '../StepperNavigator';
import StepperRadio from '../StepperRadio';
import TextWithActionLink from '../TextWithActionLink';
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
    tester: ({ type }) => type === 'ImageLink',
    renderer: ImageLink,
  },
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
    tester: ({ type }) => type === 'AuthenticatorButtonList',
    renderer: AuthenticatorButtonList,
  },
  {
    tester: ({ type }) => type === 'PasswordRequirements',
    renderer: PasswordRequirements,
  },
  {
    tester: ({ type }) => type === 'PasswordMatches',
    renderer: PasswordMatches,
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
    tester: ({ type }) => type === 'StepperLink',
    renderer: StepperLink,
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
    tester: ({ type }) => type === 'LaunchAuthenticatorButton',
    renderer: LaunchAuthenticatorButton,
  },
  {
    tester: ({ type }) => type === 'OpenOktaVerifyFPButton',
    renderer: OpenOktaVerifyFPButton,
  },
  {
    tester: ({ type }) => type === 'ChromeDtcContainer',
    renderer: ChromeDtcContainer,
  },
  {
    tester: ({ type }) => type === 'WebAuthNSubmitButton',
    renderer: WebAuthNSubmitButton,
  },
  {
    tester: ({ type }) => type === 'LoopbackProbe',
    renderer: LoopbackProbe,
  },
  {
    tester: ({ type }) => type === 'PIVButton',
    renderer: PIVButton,
  },
  {
    tester: ({ type }) => type === 'HiddenInput',
    renderer: HiddenInput,
  },
  {
    tester: (element: FieldElement) => isPhoneNumberElement(element),
    renderer: PhoneAuthenticator,
  },
  {
    tester: ({ type }) => type === 'TextWithActionLink',
    renderer: TextWithActionLink,
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
    tester: ({ type }) => type === 'Divider',
    renderer: Divider,
  },
  {
    tester: (element: FieldElement) => isRadioFieldElement(element),
    renderer: Radio,
  },
  {
    tester: (element: FieldElement) => isSelectFieldElement(element),
    renderer: Select,
  },
  {
    tester: (element: FieldElement) => isInputTextFieldElement(element),
    renderer: InputText,
  },
  {
    tester: ({ options: { inputMeta: { secret } = {} as Input } }: FieldElement) => !!secret,
    renderer: InputPassword,
  },
  {
    tester: (element: FieldElement) => isCheckboxFieldElement(element),
    renderer: Checkbox,
  },
  {
    tester: ({ type }) => type === 'Button',
    renderer: Button,
  },
  {
    tester: ({ type }) => type === 'ImageWithText',
    renderer: ImageWithText,
  },
  {
    tester: ({ type }) => type === 'AutoSubmit',
    renderer: AutoSubmit,
  },
  {
    tester: ({ type }) => type === 'StepperNavigator',
    renderer: StepperNavigator,
  },
  {
    tester: ({ type }) => type === 'DuoWindow',
    renderer: DuoWindow,
  },
  {
    tester: ({ type }) => type === 'CaptchaContainer',
    renderer: CaptchaContainer,
  },
  {
    tester: ({ type }) => type === 'IdentifierContainer',
    renderer: IdentifierContainer,
  },
] as Renderer[];
