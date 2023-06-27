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
  ListElement,
  TitleElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';
import { copyToClipboard, loc } from '../../util';

export const transformMdmTerminalView: IdxStepTransformer = ({ formBag, transaction }) => {
  // @ts-expect-error Property 'deviceEnrollment' does not exist on type 'IdxContext' ts(2339)
  const deviceEnrollment = transaction.context?.deviceEnrollment?.value;

  formBag.uischema.elements.push({
    type: 'Title',
    options: { content: loc('enroll.title.mdm', 'login') },
  } as TitleElement);

  formBag.uischema.elements.push({
    type: 'Description',
    contentType: 'subtitle',
    options: { content: loc('enroll.explanation.mdm', 'login') },
  } as DescriptionElement);

  const listItems: (string | UISchemaLayout)[] = [];
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
          variant: 'secondary',
          onClick: () => copyToClipboard(deviceEnrollment?.enrollmentLink),
        },
      } as ButtonElement,
    ],
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
    ],
  } as UISchemaLayout,
  {
    type: UISchemaLayoutType.VERTICAL,
    elements: [
      {
        type: 'Description',
        noMargin: true,
        options: {
          content: loc(
            'enroll.mdm.step.followInstructions',
            'login',
            [deviceEnrollment?.vendor],
            { $1: { element: 'span', attributes: { class: 'strong no-translate' } } },
          ),
        },
      } as DescriptionElement,
    ],
  } as UISchemaLayout,
  {
    type: UISchemaLayoutType.VERTICAL,
    elements: [
      {
        type: 'Description',
        noMargin: true,
        options: {
          content: loc('enroll.mdm.step.relogin', 'login'),
        },
      } as DescriptionElement,
    ],
  } as UISchemaLayout);

  formBag.uischema.elements.push({
    type: 'List',
    noMargin: true,
    options: {
      type: 'ol',
      items: listItems,
    },
  } as ListElement);

  return formBag;
};
