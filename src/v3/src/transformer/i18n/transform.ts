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

import { flow } from 'lodash';

import { TransformStepFnWithOptions } from '../../types';
import { transformAuthenticatorButton } from './transformAuthenticatorButton';
import { transformDefaultSelectOptionLabel } from './transformDefaultSelectOptionLabel';
import { transformField } from './transformField';
import { transformGranularConsentFields } from './transformGranularConsentFields';
import { transformIdentifierHint } from './transformIdentifierHint';
import { transformInputPassword } from './transformInputPassword';
import { transformLaunchAuthenticatorButton } from './transformLaunchAuthenticatorButton';
import { transformOpenOktaVerifyFPButton } from './transformOpenOktaVerifyFPButton';
import { transformPasscodeHint } from './transformPasscodeHint';
import { transformPasswordMatches } from './transformPasswordMatches';
import { transformPhoneAuthenticator } from './transformPhoneAuthenticator';
import { transformQRCode } from './transformQRCode';
import { transformSecondEmailInputExplain } from './transformSecondEmailInputExplain';
import { transformWebAuthNSubmitButton } from './transformWebAuthNSubmitButton';

export const transformI18n: TransformStepFnWithOptions = (options) => (formbag) => flow(
  transformField(options),
  transformGranularConsentFields(options),
  transformAuthenticatorButton(options),
  transformInputPassword,
  transformPhoneAuthenticator,
  transformQRCode,
  transformIdentifierHint(options),
  transformPasscodeHint(options),
  transformSecondEmailInputExplain(options),
  transformWebAuthNSubmitButton(options),
  transformLaunchAuthenticatorButton,
  transformOpenOktaVerifyFPButton,
  transformPasswordMatches(options),
  transformDefaultSelectOptionLabel,
)(formbag);
