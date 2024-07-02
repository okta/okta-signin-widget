/*
 * Copyright (c) 2024-present, Okta, Inc. and/or its affiliates. All rights reserved.
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
} from '../../../types';
import { loc } from '../../../util';

export const transformUnlockAccount: IdxStepTransformer = ({ formBag }) => {
  const { uischema } = formBag;

  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: loc('account.unlock.title', 'login') },
  };

  uischema.elements.unshift(titleElement);

  return formBag;
};
