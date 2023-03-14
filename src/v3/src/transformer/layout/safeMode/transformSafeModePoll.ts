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
  DescriptionElement,
  IdxStepTransformer,
  SpinnerElement,
  TitleElement,
} from '../../../types';
import { generateRandomString, loc } from '../../../util';

export const transformSafeModePoll: IdxStepTransformer = ({
  transaction,
  formBag,
}) => {
  const { uischema } = formBag;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('poll.form.title', 'login'),
    },
  };

  const pollIntervalMs = transaction.nextStep?.refresh;

  if (typeof pollIntervalMs !== 'number') {
    return formBag;
  }

  const pollIntervalSec = Math.ceil(pollIntervalMs / 1000);

  const descriptionElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc(
        'poll.form.message',
        'login',
        [pollIntervalSec],
        { $1: { element: 'span' } },
      ),
    },
  };

  const spinnerElement = {
    type: 'Spinner',
    // random key to force re-render of this element during polling
    key: generateRandomString(),
    options: {
      // show spinner for a maximum of one second before view re-renders
      delayMs: Math.max(pollIntervalMs - 1000, 0),
    },
  } as SpinnerElement;

  uischema.elements.push(
    titleElement,
    descriptionElement,
    spinnerElement,
  );

  return formBag;
};
