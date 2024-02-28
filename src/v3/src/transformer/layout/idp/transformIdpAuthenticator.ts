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

import Util from '../../../../../util/Util';
import { IDX_STEP } from '../../../constants';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  RedirectElement,
  SpinnerElement,
  TitleElement,
} from '../../../types';
import { getDisplayName, loc } from '../../../util';

// This is the page where the user launches the selected IDP authenticator
export const transformIdpAuthenticator: IdxStepTransformer = ({
  formBag,
  transaction,
  widgetProps,
}) => {
  const { uischema } = formBag;
  const { nextStep } = transaction;
  const { features } = widgetProps;
  const displayName = getDisplayName(transaction);
  const isEnrollStep = nextStep?.name === IDX_STEP.ENROLL_AUTHENTICATOR;
  // In case of failure, don't auto-redirect which will result in infinite redirects.
  const autoRedirect = features?.skipIdpFactorVerificationBtn && !transaction.messages?.length;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: isEnrollStep
        ? loc('oie.idp.enroll.title', 'login', [displayName])
        : loc('oie.idp.challenge.title', 'login', [displayName]),
    },
  };

  const descriptionElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: isEnrollStep
        ? loc('oie.idp.enroll.description', 'login', [displayName])
        : loc('oie.idp.challenge.description', 'login', [displayName]),
    },
  };

  const submitButton: ButtonElement = {
    type: 'Button',
    label: isEnrollStep
      ? loc('mfa.enroll', 'login')
      : loc('mfa.challenge.verify', 'login'),
    options: {
      type: ButtonType.BUTTON,
      step: nextStep!.name,
      isActionStep: false,
      onClick: () => {
        Util.redirectWithFormGet(nextStep?.href);
      },
    },
  };

  const redirectElement: RedirectElement = {
    type: 'Redirect',
    options: {
      url: nextStep!.href!,
    },
  };

  const spinner: SpinnerElement = {
    type: 'Spinner',
  };

  uischema.elements = [
    titleElement,
    descriptionElement,
  ];

  if (autoRedirect) {
    uischema.elements.push(spinner);
    uischema.elements.push(redirectElement);
  } else {
    uischema.elements.push(submitButton);
  }

  return formBag;
};
