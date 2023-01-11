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

import { CHALLENGE_METHOD } from '../../../constants';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  ListElement,
  TitleElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../../types';
import { loc } from '../../../util';

export const transformOdaEnrollment: IdxStepTransformer = ({ formBag, transaction }) => {
  // @ts-expect-error deviceEnrollment does not exist on IdxTransaction.context
  const deviceEnrollment = transaction.context?.deviceEnrollment?.value;

  if (deviceEnrollment?.name === 'oda') {
    const { signInUrl, platform: rawPlatform = '' } = deviceEnrollment;
    const platform: string = rawPlatform.toLowerCase();
    const isIOS = platform === 'ios';
    const isAndroid = platform === 'android';
    const challengeMethod = deviceEnrollment?.challengeMethod;

    formBag.uischema.elements.push({
      type: 'Title',
      options: { content: loc('enroll.title.oda', 'login')},
    } as TitleElement);
      
    formBag.uischema.elements.push({
      type: 'Description',
      options: { content: loc('enroll.explanation.p1', 'login') },
    } as DescriptionElement);

    const listItems: (string | UISchemaLayout)[] = [];

    if (isIOS) {
      listItems.push({
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Description',
            noMargin: true,
            options: {
              content: loc('enroll.mdm.step.copyLink', 'login'),
            },
          } as DescriptionElement,
          {
            type: 'Button',
            label: loc('enroll.mdm.copyLink'),
            options: {
              step: '',
              type: ButtonType.BUTTON,
              onClick: () => {},
              variant: 'secondary',
            }
          } as ButtonElement,
        ]
      } as UISchemaLayout,
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Description',
            noMargin: true,
            options: {
              content: loc('enroll.mdm.step.pasteLink', 'login'),
            },
          } as DescriptionElement,
        ]
      } as UISchemaLayout,
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Description',
            noMargin: true,
            options: {
              content: loc('enroll.oda.step3', 'login'),
            },
          } as DescriptionElement,
        ]
      } as UISchemaLayout);
    } else if (isAndroid && challengeMethod === CHALLENGE_METHOD.LOOPBACK) {
      listItems.push({
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Description',
            noMargin: true,
            options: {
              content: loc('enroll.oda.android.step1', 'login'),
            },
          } as DescriptionElement,
        ],
      });
    }

    listItems.push({
      type: UISchemaLayoutType.VERTICAL,
      elements: [
        {
          type: 'Description',
          noMargin: true,
          options: {
            content: loc('enroll.oda.step1', 'login'),
          },
        } as DescriptionElement,
      ]
    } as UISchemaLayout,
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
            variant: 'secondary',
          }
        } as ButtonElement,
      ]
    } as UISchemaLayout,
    {
      type: UISchemaLayoutType.VERTICAL,
      elements: [
        {
          type: 'Description',
          noMargin: true,
          options: {
            content: loc('enroll.oda.step6', 'login'),
          },
        } as DescriptionElement,
      ]
    } as UISchemaLayout);

    formBag.uischema.elements.push({
      type: 'List',
      noMargin: true,
      options: {
        type: 'ordered',
        items: listItems,
      },
    } as ListElement);
  }

  return formBag;
};