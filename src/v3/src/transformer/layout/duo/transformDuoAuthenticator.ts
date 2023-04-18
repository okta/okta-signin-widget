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

import { NextStep } from '@okta/okta-auth-js';

import { IDX_STEP } from '../../../constants';
import {
  DuoWindowElement,
  IdxStepTransformer,
  TitleElement,
} from '../../../types';
import { loc } from '../../../util';

export const transformDuoAuthenticator: IdxStepTransformer = ({
  formBag,
  transaction,
}) => {
  const { uischema } = formBag;
  const { nextStep = {} as NextStep } = transaction;
  const stepName = nextStep.name;
  const authenticatorContextualData = nextStep.relatesTo?.value.contextualData;

  const titleText = stepName === IDX_STEP.ENROLL_AUTHENTICATOR
    ? loc('oie.duo.enroll.title', 'login')
    : loc('oie.duo.verify.title', 'login');

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: titleText,
    },
  };

  const duoWindowElement: DuoWindowElement = {
    type: 'DuoWindow',
    options: {
      title: titleText,
      // @ts-expect-error OKTA-601240 : missing property from contextualData type
      host: authenticatorContextualData?.host,
      // @ts-expect-error OKTA-601240 : missing property from contextualData type
      signedToken: authenticatorContextualData?.signedToken,
      step: stepName,
    },
  };

  uischema.elements = [
    titleElement,
    duoWindowElement,
  ];

  return formBag;
};
