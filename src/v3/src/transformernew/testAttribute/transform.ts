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

import { ButtonElement, ButtonType } from '../../types';
import { TransformStepFn } from '../main';
import { updateElementsInLayout } from '../util';

const map: Record<string, string> = {
  'button.select-enroll-profile': 'enroll',
  'button.currentAuthenticator-recover': 'forgot-password',
  'button.unlock-account': 'unlock',
};

export const transformTestAttributes: TransformStepFn = (formbag) => {
  const { uischema } = formbag;

  updateElementsInLayout({
    layout: uischema,
    updateFn: (element) => {
      const { options } = element as ButtonElement;
      if (options.type === ButtonType.SUBMIT) {
        options.dataSe = 'submit';
      } else {
        options.dataSe = map[`button.${options.step}`];
      }
    },
    predicateFn: (element) => {
      const { type } = element as ButtonElement;
      return type === 'Button';
    },
  });

  return formbag;
};
