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
  IdxStepTransformer,
  TitleElement,
  UISchemaElement,
} from '../../types';
import { getUIElementWithName } from '../utils';

const getContentTitleAndParams = (brandName?: string): TitleElement['options'] => {
  if (brandName) {
    return { content: 'password.reset.title.specific', contentParams: [brandName] };
  }
  return { content: 'password.reset.title.generic' };
};

export const transformIdentityRecovery: IdxStepTransformer = ({ formBag, widgetProps }) => {
  const { brandName } = widgetProps;
  const { uischema } = formBag;

  const identifierElement = getUIElementWithName('identifier', uischema.elements as UISchemaElement[]);

  if (identifierElement) {
    identifierElement.label = 'password.forgot.email.or.username.placeholder';
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: getContentTitleAndParams(brandName),
  };

  uischema.elements.unshift(titleElement);

  return formBag;
};
