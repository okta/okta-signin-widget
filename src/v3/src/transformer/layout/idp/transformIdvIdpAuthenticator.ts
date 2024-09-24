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
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  DividerElement,
  IdxStepTransformer,
  IWidgetContext,
  LinkElement,
  TitleElement,
} from '../../../types';
import { getIDVDisplayName, loc } from '../../../util';

export const transformIdvIdpAuthenticator: IdxStepTransformer = ({
  formBag,
  transaction,
}) => {
  const { uischema } = formBag;
  const { nextStep } = transaction;
  const displayName = getIDVDisplayName(transaction);

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.idv.idp.title', 'login', [displayName]),
    },
  };

  const descriptionElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.idv.idp.description', 'login'),
    },
  };

  const termsOfUseDescription: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      variant: 'subtitle1',
      content: loc('oie.idv.idp.description.termsOfUse', 'login', undefined, {
        $1: {
          element: 'a',
          attributes: {
            class: 'terms-of-use', href: 'https://withpersona.com/legal/terms-of-use', target: '_blank', rel: 'noopener noreferrer',
          },
        },
        $2: {
          element: 'a',
          attributes: {
            class: 'privacy-policy', href: 'https://withpersona.com/legal/privacy-policy', target: '_blank', rel: 'noopener noreferrer',
          },
        },
      }),
    },
  };

  const agreementDescription: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.idv.idp.description.agreement', 'login'),
      variant: 'subtitle1',
    },
  };

  const submitButton: ButtonElement = {
    type: 'Button',
    label: loc('oie.optional.authenticator.button.title', 'login'),
    options: {
      type: ButtonType.BUTTON,
      step: nextStep!.name,
      isActionStep: false,
      onClick: (widgetContext?: IWidgetContext) => {
        widgetContext?.setLoading?.(true);
        Util.redirectWithFormGet(nextStep?.href);
      },
    },
  };

  const divider: DividerElement = {
    type: 'Divider',
  };
  uischema.elements.push(divider);

  const cancelLink: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('goback', 'login'),
      isActionStep: true,
      step: 'cancel',
    },
  };

  uischema.elements = [
    titleElement,
    descriptionElement,
    submitButton,
    divider,
    cancelLink,
    termsOfUseDescription,
    agreementDescription,
  ];

  return formBag;
};
