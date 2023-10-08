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
import { transformCancelButton } from './transformCancelButton';
import { transformFactorPageCustomLink } from './transformFactorPageCustomLink';
import { transformForgotPasswordButton } from './transformForgotPasswordButton';
import { transformHelpLinks } from './transformHelpLinks';
import { transformIDPButtons } from './transformIDPButtons';
import { transformRegisterButton } from './transformRegisterButton';
import { transformReturnToAuthenticatorListButton } from './transformReturnToAuthenticatorListButton';
import { transformSubmitButton } from './transformSubmitButton';
import { transformUnlockAccountButton } from './transformUnlockAccountButton';
import { transformVerifyWithOtherButton } from './transformVerifyWithOtherButton';

export const transformButtons: TransformStepFnWithOptions = (options) => (formbag) => flow(
  transformSubmitButton(options),
  transformForgotPasswordButton(options),
  transformUnlockAccountButton(options),
  transformHelpLinks(options),
  transformFactorPageCustomLink(options),
  transformVerifyWithOtherButton(options),
  transformReturnToAuthenticatorListButton(options),
  transformRegisterButton(options),
  transformCancelButton(options),
  transformIDPButtons(options),
)(formbag);
