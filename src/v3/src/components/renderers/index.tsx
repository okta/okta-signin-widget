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

import {
  and,
  isBooleanControl,
  isEnumControl,
  isStringControl,
  optionIs,
  rankWith,
  scopeEndIs,
  scopeEndsWith,
  uiTypeIs,
} from '@jsonforms/core';
import {
  withJsonFormsCellProps,
  withJsonFormsContext,
  withJsonFormsControlProps,
} from '@jsonforms/react';
import { vanillaRenderers } from '@jsonforms/vanilla-renderers';

import { withFormValidationState, withFormValidationStateAndContext } from '../hocs';
import
AuthenticatorListControl,
{ tester as authenticatorListControlTester } from './authenticatorListControl/AuthenticatorListControl';
import ButtonControl, { buttonControlTester } from './buttonControl/ButtonControl';
import WebAuthNSubmitControl from './buttonControl/WebAuthNSubmitControl';
import SuccessCallbackControl from './callbackControl/SuccessCallbackControl';
import CheckboxControl from './checkboxControl/CheckboxControl';
import FastPassButtonControl, { tester as fastPassButtonControlTester } from './fastPassButtonControl/FastPassButtonControl';
import ImageWithTextControl from './imageWithTextControl/ImageWithTextControl';
import InfoBoxControl from './infoBoxControl/InfoBoxControl';
import InformationalTextControl from './informationalTextControl/informationalTextControl';
import InputPasswordControl from './inputPasswordControl/InputPasswordControl';
import InputTextControl from './inputTextControl/InputTextControl';
import InputTextHiddenControl from './inputTextHiddenControl/inputTextHiddenControl';
import InputVerificationCodeControl from './inputVerificationCodeControl/InputVerificationCodeControl';
import LinkControl from './linkControl/LinkControl';
import ListControl from './listControl/ListControl';
import PasswordRequirementsControl from './passwordRequirementsControl/PasswordRequirementsControl';
import PhoneAuthenticatorControl from './phoneAuthControl/PhoneAuthenticatorControl';
import QrCodeControl from './qrCodeControl/QrCodeControl';
import RadioControl from './radioControl/RadioControl';
import RedirectControl from './redirectControl/RedirectControl';
import ReminderPromptControl from './reminderPromptControl/ReminderPromptControl';
import SelectControl from './selectControl/SelectControl';
import SpinnerControl from './spinner/Spinner';
import StepperRenderer from './stepperRenderer/StepperRenderer';
import TitleControl from './titleControl/titleControl';

export const renderers = [
  ...vanillaRenderers,
  {
    tester: rankWith(3, scopeEndsWith('phoneNumber')),
    renderer: withJsonFormsControlProps(
      withFormValidationStateAndContext(withJsonFormsContext(PhoneAuthenticatorControl)),
    ),
  },
  {
    tester: rankWith(3, isStringControl),
    renderer: withJsonFormsControlProps(withFormValidationState(InputTextControl)),
  },
  {
    tester: rankWith(3, isBooleanControl),
    renderer: withJsonFormsControlProps(withFormValidationState(CheckboxControl)),
  },
  {
    tester: rankWith(4, uiTypeIs('Title')),
    renderer: withJsonFormsCellProps(TitleControl),
  },
  {
    tester: rankWith(4, uiTypeIs('Description')),
    renderer: withJsonFormsCellProps(InformationalTextControl),
  },
  {
    tester: rankWith(6, and(isEnumControl, optionIs('format', 'radio'))),
    renderer: withJsonFormsControlProps(RadioControl),
  },
  {
    tester: rankWith(6, and(isEnumControl, optionIs('format', 'dropdown'))),
    renderer: withJsonFormsControlProps(withFormValidationState(SelectControl)),
  },
  {
    tester: rankWith(7, authenticatorListControlTester),
    renderer: withJsonFormsControlProps(withJsonFormsContext(AuthenticatorListControl)),
  },
  {
    tester: rankWith(9, scopeEndIs('verificationCode')),
    renderer: withJsonFormsControlProps(withFormValidationState(InputVerificationCodeControl)),
  },
  {
    tester: rankWith(9, uiTypeIs('Spinner')),
    renderer: withJsonFormsCellProps(SpinnerControl),
  },
  {
    tester: rankWith(9, uiTypeIs('Button')),
    // TODO: create new renderer function per OKTA-473161
    renderer: withJsonFormsCellProps(WebAuthNSubmitControl),
  },
  {
    tester: rankWith(9, uiTypeIs('InfoBox')),
    renderer: withJsonFormsCellProps(InfoBoxControl),
  },
  {
    tester: rankWith(9, uiTypeIs('Link')),
    renderer: withJsonFormsCellProps(LinkControl),
  },
  {
    tester: rankWith(9, uiTypeIs('List')),
    renderer: withJsonFormsCellProps(ListControl),
  },
  {
    tester: rankWith(9, uiTypeIs('QRCode')),
    renderer: withJsonFormsCellProps(QrCodeControl),
  },
  {
    tester: rankWith(10, optionIs('secret', true)),
    renderer: withJsonFormsControlProps(withFormValidationState(InputPasswordControl)),
  },
  {
    tester: rankWith(10, optionIs('format', 'ImageWithText')),
    renderer: withJsonFormsCellProps(ImageWithTextControl),
  },
  {
    tester: buttonControlTester,
    renderer: withJsonFormsControlProps(ButtonControl),
  },
  {
    tester: fastPassButtonControlTester,
    renderer: withJsonFormsControlProps(FastPassButtonControl),
  },
  {
    tester: rankWith(11, uiTypeIs('Stepper')),
    renderer: StepperRenderer,
  },
  {
    tester: rankWith(11, uiTypeIs('Reminder')),
    renderer: withJsonFormsCellProps(ReminderPromptControl),
  },
  {
    tester: rankWith(11, uiTypeIs('PasswordRequirements')),
    renderer: withJsonFormsCellProps(withJsonFormsContext(PasswordRequirementsControl)),
  },
  {
    tester: rankWith(11, uiTypeIs('SuccessCallback')),
    renderer: withJsonFormsCellProps(SuccessCallbackControl),
  },
  {
    tester: rankWith(11, uiTypeIs('Redirect')),
    renderer: withJsonFormsCellProps(RedirectControl),
  },
  {
    tester: rankWith(12, optionIs('type', 'hidden')),
    renderer: withJsonFormsControlProps(InputTextHiddenControl),
  },
];
