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
  ButtonElement,
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  TitleElement,
} from '../../../types';
import { loc } from '../../../util';

export const transformKeepMeSignedIn: IdxStepTransformer = ({ transaction, formBag }) => {
  const { uischema } = formBag;
  const {
    nextStep: {
      name: step,
    } = {},
  } = transaction;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.kmsi.title', 'login'),
    },
  };

  const descriptionElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.kmsi.subtitle', 'login'),
    },
  };

  const acceptButton: ButtonElement = {
    type: 'Button',
    label: loc('oie.kmsi.accept', 'login'),
    options: {
      type: ButtonType.BUTTON,
      variant: 'secondary',
      dataType: 'save',
      actionParams: { keepMeSignedIn: true },
      step: step!,
      dataSe: 'stay-signed-in-btn',
    },
  };

  const rejectButton: ButtonElement = {
    type: 'Button',
    label: loc('oie.kmsi.reject', 'login'),
    options: {
      type: ButtonType.BUTTON,
      variant: 'secondary',
      actionParams: { keepMeSignedIn: false },
      dataType: 'cancel',
      step: step!,
      dataSe: 'do-not-stay-signed-in-btn',
    },
  };

  uischema.elements = [
    titleElement,
    descriptionElement,
    acceptButton,
    rejectButton,
  ];

  return formBag;
};
