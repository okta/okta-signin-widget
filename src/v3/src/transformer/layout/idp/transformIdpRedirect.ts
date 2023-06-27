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

import { IDX_STEP } from '../../../constants';
import {
  IdxStepTransformer,
  TitleElement,
} from '../../../types';
import { getIdpButtonElements, isOauth2Enabled, loc } from '../../../util';
import { redirectTransformer } from '../../redirect';

export const transformIdpRedirect: IdxStepTransformer = ({
  formBag, transaction, widgetProps, prevTransaction,
}) => {
  const { uischema } = formBag;
  const { neededToProceed: remediations, nextStep } = transaction;
  const redirectIdpRemediations = remediations.filter((idp) => idp.name === IDX_STEP.REDIRECT_IDP);

  // IF there is one `redirect-idp` remediation form, widget will automatically redirect to `redirect-idp.href`.
  if (redirectIdpRemediations.length === 1) {
    const isDirectAuth = isOauth2Enabled(widgetProps);
    // Direct auth clients should not redirect on the initial response
    if (!isDirectAuth || prevTransaction) {
      nextStep!.name = IDX_STEP.SUCCESS_REDIRECT;
      nextStep!.href = redirectIdpRemediations[0].href;
      return redirectTransformer(
        transaction,
        redirectIdpRemediations[0].href!,
        widgetProps,
      );
    }
  }

  const idpButtonElements = getIdpButtonElements(transaction, widgetProps);
  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('primaryauth.title', 'login'),
    },
  };
  uischema.elements = [
    titleElement,
    ...idpButtonElements,
  ];

  return formBag;
};
