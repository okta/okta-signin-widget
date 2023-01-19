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
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  ListElement,
  StepperButtonElement,
  StepperRadioElement,
  TitleElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../../types';
import { loc } from '../../../util';

export const transformOdaEnrollmentAndroidAppLink: IdxStepTransformer = ({ formBag, transaction }) => {
  // @ts-expect-error deviceEnrollment does not exist on IdxTransaction.context
  const deviceEnrollment = transaction.context?.deviceEnrollment?.value;

  const {
    challengeMethod,
    signInUrl,
  } = deviceEnrollment;

  formBag.uischema.elements.push({
    type: UISchemaLayoutType.STEPPER,
    elements: [
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Title',
            options: { content: loc('enroll.title.oda.with.account', 'login')},
          } as TitleElement,
          {
            type: 'StepperRadio',
            options: {
              name: 'hasOVAccount',
              customOptions: [
                {
                  value: 'no',
                  label: loc('enroll.option.noaccount.fastpass', 'login'),
                  callback: (widgetContext, stepIndex) => {
                    // TODO figure out how to set data or modify the next view based on this
                  },
                },
                {
                  value: 'yes',
                  label: loc('enroll.option.account.fastpass', 'login'),
                  callback: (widgetContext, stepIndex) => {
                    // TODO figure out how to set data or modify the next view based on this
                  },
                }
              ],
            },
          } as StepperRadioElement,
          {
            type: 'StepperButton',
            label: loc('oform.next', 'login'),
            options: {
              type: ButtonType.BUTTON,
              variant: 'primary',
              nextStepIndex: 1,
            },
          } as StepperButtonElement,
        ],
      } as UISchemaLayout,
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Title',
            options: { content: loc('enroll.title.oda.with.account', 'login')},
          } as TitleElement,
          {
            type: 'Description',
            options: { content: loc('enroll.oda.with.account.explanation', 'login') },
          } as DescriptionElement,
          {
            type: 'Description',
            options: { content: loc('enroll.oda.with.account.subtitile1', 'login') },
          } as DescriptionElement,
          {
            type: 'List',
            noMargin: true,
            options: {
              type: 'ordered',
              items: [
                loc('enroll.oda.with.account.step1', 'login'),
                loc('enroll.oda.with.account.step2', 'login'),
                loc('enroll.oda.with.account.step3', 'login'),
              ],
            },
          } as ListElement,
          {
            type: 'Description',
            options: { content: loc('enroll.oda.with.account.subtitile2', 'login') },
          } as DescriptionElement,
          {
            type: 'List',
            noMargin: true,
            options: {
              type: 'ordered',
              items: [
                loc('enroll.oda.with.account.step4', 'login'),
                loc('enroll.oda.with.account.step5', 'login', [signInUrl]),
                loc('enroll.oda.with.account.step6', 'login'),
                loc('enroll.oda.with.account.step7', 'login'),
              ],
            },
          },
        ],
      } as UISchemaLayout,
    ],
  });

  return formBag;
};