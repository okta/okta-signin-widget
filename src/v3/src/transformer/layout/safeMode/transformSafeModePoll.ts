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
  IStepperContext,
  SpinnerElement,
  StepperNavigatorElement,
  TitleElement,
  UISchemaElement,
  UISchemaLayout,
  UISchemaLayoutType,
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
  } as SpinnerElement;

  const stepperNavigatorElement: StepperNavigatorElement = {
    type: 'StepperNavigator',
    options: {
      callback: (stepperContext: IStepperContext) => {
        const { setStepIndex } = stepperContext;
        // show the second step (with the spinner) at most one second before the
        // call to the endpoint happens
        setTimeout(() => setStepIndex!(1), Math.max(pollIntervalMs - 1000, 0));
      },
    },
  };

  uischema.elements.push({
    type: UISchemaLayoutType.STEPPER,
    // Always re-render this stepper and children components when this transformer is
    // called so that the stepper gets reset after the polling happens
    key: generateRandomString(),
    elements: [
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          titleElement,
          descriptionElement,
          stepperNavigatorElement,
        ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 0 })),
      } as UISchemaLayout,
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          titleElement,
          spinnerElement,
        ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 1 })),
      } as UISchemaLayout],
  });

  return formBag;
};
