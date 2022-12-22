/*
 * Copyright (c) 2022-present, Okta, Inc. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant
 * to the Apache License, Version 2.0 (the "License.")
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  DescriptionElement,
  IdxStepTransformer,
  PIVButtonElement,
  TitleElement,
} from '../../../types';
import { loc } from '../../../util';

export const transformPIVAuthenticator: IdxStepTransformer = ({ formBag }) => {
  const { uischema } = formBag;

  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: loc('piv.cac.title', 'login') },
  };

  const descriptionElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: { content: loc('piv.cac.card.insert', 'login') },
  };

  const buttonLabel = loc('retry', 'login');
  const buttonElement: PIVButtonElement = {
    type: 'PIVButton',
    label: buttonLabel,
    translations: [{ i18nKey: 'retry', name: 'label', value: buttonLabel }],
  };

  uischema.elements = [
    titleElement,
    descriptionElement,
    buttonElement,
  ];

  return formBag;
};
