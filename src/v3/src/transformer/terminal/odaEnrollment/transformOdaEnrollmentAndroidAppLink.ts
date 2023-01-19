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
  FieldElement,
  IdxStepTransformer,
  ListElement,
  StepperButtonElement,
  TextWithHtmlElement,
  TitleElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../../types';
import { copyToClipboard, loc } from '../../../util';

export const transformOdaEnrollmentAndroidAppLink: IdxStepTransformer = ({
  formBag,
  transaction,
}) => {
  // @ts-expect-error deviceEnrollment does not exist on IdxTransaction.context
  const deviceEnrollment = transaction.context?.deviceEnrollment?.value;

  const { signInUrl } = deviceEnrollment;

  formBag.data.hasOVAccount = 'no';

  formBag.uischema.elements.push({
    type: UISchemaLayoutType.STEPPER,
    elements: [
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Title',
            options: { content: loc('enroll.title.oda.with.account', 'login') },
          } as TitleElement,
          {
            type: 'Field',
            key: 'hasOVAccount',
            translations: [{
              name: 'label',
              i18nKey: 'enroll.subtitle.fastpass',
              value: loc('enroll.subtitle.fastpass', 'login'),
            }],
            options: {
              inputMeta: {
                name: 'hasOVAccount',
                options: [
                  {
                    value: 'no',
                    label: loc('enroll.option.noaccount.fastpass', 'login'),
                  },
                  {
                    value: 'yes',
                    label: loc('enroll.option.account.fastpass', 'login'),
                  },
                ],
              },
              format: 'radio',
              name: 'hasOVAccount',
            },
          } as FieldElement,
          {
            type: 'StepperButton',
            label: loc('oform.next', 'login'),
            options: {
              type: ButtonType.BUTTON,
              variant: 'primary',
              nextStepIndex: (widgetContext) => {
                const { data } = widgetContext;

                if (data.hasOVAccount === 'yes') {
                  return 1;
                }
                return 2;
              },
            },
          } as StepperButtonElement,
        ],
      } as UISchemaLayout,
      // Android App Link with Account
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Title',
            options: { content: loc('enroll.title.oda.with.account', 'login') },
          } as TitleElement,
          {
            type: 'Description',
            options: { content: loc('enroll.oda.with.account.explanation', 'login') },
          } as DescriptionElement,
          {
            type: 'List',
            noMargin: true,
            options: {
              description: loc('enroll.oda.with.account.subtitile1', 'login'),
              type: 'unordered',
              items: [
                {
                  type: UISchemaLayoutType.VERTICAL,
                  elements: [
                    {
                      type: 'Description',
                      noMargin: true,
                      options: { content: loc('enroll.oda.with.account.step1', 'login') },
                    } as DescriptionElement,
                  ],
                } as UISchemaLayout,
                {
                  type: UISchemaLayoutType.VERTICAL,
                  elements: [
                    {
                      type: 'Description',
                      noMargin: true,
                      options: { content: loc('enroll.oda.with.account.step2', 'login') },
                    } as DescriptionElement,
                  ],
                },
                {
                  type: UISchemaLayoutType.VERTICAL,
                  elements: [
                    {
                      type: 'Description',
                      noMargin: true,
                      options: { content: loc('enroll.oda.with.account.step3', 'login') },
                    } as DescriptionElement,
                  ],
                },
              ],
            },
          } as ListElement,
          {
            type: 'List',
            noMargin: true,
            options: {
              description: loc('enroll.oda.with.account.subtitile2', 'login'),
              type: 'ordered',
              items: [
                {
                  type: UISchemaLayoutType.VERTICAL,
                  elements: [
                    {
                      type: 'Description',
                      noMargin: true,
                      options: { content: loc('enroll.oda.with.account.step4', 'login') },
                    } as DescriptionElement,
                  ],
                },
                {
                  type: UISchemaLayoutType.VERTICAL,
                  elements: [
                    {
                      type: 'Description',
                      noMargin: true,
                      options: { content: loc('enroll.oda.with.account.step5', 'login', [signInUrl]) },
                    } as DescriptionElement,
                  ],
                },
                {
                  type: UISchemaLayoutType.VERTICAL,
                  elements: [
                    {
                      type: 'Description',
                      noMargin: true,
                      options: { content: loc('enroll.oda.with.account.step6', 'login') },
                    } as DescriptionElement,
                  ],
                },
                {
                  type: UISchemaLayoutType.VERTICAL,
                  elements: [
                    {
                      type: 'Description',
                      noMargin: true,
                      options: { content: loc('enroll.oda.with.account.step7', 'login') },
                    } as DescriptionElement,
                  ],
                },
              ],
            },
          },
        ],
      } as UISchemaLayout,
      // Android App Link without Account
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Title',
            options: { content: loc('enroll.title.oda.without.account', 'login') },
          } as TitleElement,
          {
            type: 'Description',
            options: { content: loc('enroll.oda.without.account.explanation', 'login') },
          } as DescriptionElement,
          {
            type: 'List',
            noMargin: true,
            options: {
              type: 'ordered',
              items: [
                {
                  type: UISchemaLayoutType.VERTICAL,
                  elements: [
                    {
                      type: 'TextWithHtml',
                      options: {
                        content: loc('enroll.oda.without.account.step1', 'login', ['https://play.google.com/store/apps/details?id=com.okta.android.auth']),
                        submitOnClick: false,
                      },
                    } as TextWithHtmlElement,
                  ],
                } as UISchemaLayout,
                {
                  type: UISchemaLayoutType.VERTICAL,
                  elements: [
                    {
                      type: 'Description',
                      noMargin: true,
                      options: { content: loc('enroll.oda.step1', 'login') },
                    } as DescriptionElement,
                  ],
                },
                {
                  type: UISchemaLayoutType.VERTICAL,
                  elements: [
                    {
                      type: 'Description',
                      noMargin: true,
                      options: {
                        content: loc('enroll.oda.step2', 'login'),
                      },
                    } as DescriptionElement,
                    {
                      type: 'Description',
                      noMargin: true,
                      options: {
                        content: signInUrl,
                      },
                    } as DescriptionElement,
                    {
                      type: 'Button',
                      label: loc('enroll.oda.org.copyLink', 'login'),
                      options: {
                        step: '',
                        type: ButtonType.BUTTON,
                        variant: 'secondary',
                        onClick: () => copyToClipboard(deviceEnrollment?.signInUrl),
                      },
                    } as ButtonElement,
                  ],
                } as UISchemaLayout,
                loc('enroll.oda.without.account.step4', 'login'),
              ],
            },
          } as ListElement,
        ],
      } as UISchemaLayout,
    ],
  });

  return formBag;
};
