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
  IdxStepTransformer,
  InfoboxElement,
  TitleElement,
} from '../../../types';
import { loc } from '../../../util';

export const transformRequestActivation: IdxStepTransformer = ({ formBag, transaction }) => {
  const { uischema } = formBag;
  const { nextStep } = transaction;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.activation.request.email.title.expire', 'login'),
    },
  };
  const submitButtonControl: ButtonElement = {
    type: 'Button',
    label: loc('oie.activation.request.email.button', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: nextStep!.name,
    },
  };

  const expiredMessage: InfoboxElement = {
    type: 'InfoBox',
    options: {
      class: 'ERROR',
      message: {
        class: 'ERROR',
        message: loc('idx.expired.activation.token', 'login'),
        i18n: { key: 'idx.expired.activation.token' },
      },
      dataSe: 'callout',
    },
  };

  uischema.elements = [
    titleElement,
    expiredMessage,
    submitButtonControl,
  ];

  return formBag;
};
