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

import { IdxFeature } from '@okta/okta-auth-js';

import { IDX_STEP } from '../../constants';
import {
  DescriptionElement,
  LinkElement,
  TransformStepFnWithOptions,
  UISchemaLayoutType,
} from '../../types';
import { isConfigRecoverFlow, loc } from '../../util';

export const transformRegisterButton: TransformStepFnWithOptions = ({
  transaction,
  widgetProps,
}) => (
  formbag,
) => {
  const { availableSteps, enabledFeatures, nextStep } = transaction;
  const hasIdentityStep = availableSteps?.some((s) => s.name === IDX_STEP.IDENTIFY);
  const isLaunchAuthenticatorStep = nextStep?.name === IDX_STEP.LAUNCH_AUTHENTICATOR;
  const isRedirectIdpStep = nextStep?.name === IDX_STEP.REDIRECT_IDP;
  const shouldAddDefaultButton = enabledFeatures?.includes(IdxFeature.REGISTRATION)
    && (hasIdentityStep || isLaunchAuthenticatorStep || isRedirectIdpStep);
  const registerStep = availableSteps?.find(
    ({ name }) => name === IDX_STEP.SELECT_ENROLL_PROFILE,
  );

  // TODO
  // OKTA-651781
  // when flow param is set to resetPassword, the identify page is redressed as identify-recovery page
  // so this link needs to be hidden
  if (isConfigRecoverFlow(widgetProps.flow)) {
    return formbag;
  }

  if (!shouldAddDefaultButton || typeof registerStep === 'undefined') {
    return formbag;
  }

  const { registration } = widgetProps;
  formbag.uischema.elements.push({
    type: 'Divider',
  });
  const { name: step } = registerStep;
  const registerLink: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('registration.signup.text', 'login'),
      step,
    },
  };
  if (typeof registration?.click === 'function') {
    registerLink.options.onClick = registration.click;
  }
  const registrationLabel: DescriptionElement = {
    type: 'Description',
    options: {
      content: loc('registration.signup.label', 'login'),
      dataSe: 'signup-info',
    },
  };
  const registerEntryLayout = {
    type: UISchemaLayoutType.HORIZONTAL,
    elements: [registrationLabel, registerLink],
  };

  formbag.uischema.elements.push(registerEntryLayout);

  return formbag;
};
