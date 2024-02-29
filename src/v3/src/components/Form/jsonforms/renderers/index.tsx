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
  and,
  isBooleanControl,
  isControl,
  // isEnumControl,
  isStringControl,
  optionIs,
  or,
  rankWith,
  // scopeEndsWith,
  uiTypeIs,
} from '@jsonforms/core';
import { vanillaRenderers } from '@jsonforms/vanilla-renderers';

import { ActionEvent, ActionStyle, LabelStyle } from '../../../../types';
import ButtonElement from './ButtonElement/ButtonElement';
import CheckboxControl from './CheckboxControl/CheckboxControl';
import DividerElement from './DividerElement/DividerElement';
import ImageElement from './ImageElement/ImageElement';
import InputPasswordControl from './InputPasswordControl/InputPasswordControl';
import InputTextControl from './InputTextControl/InputTextControl';
import LinkButtonElement from './LinkButtonElement/LinkButtonElement';
import LinkElement from './LinkElement/LinkElement';
import TextElement from './TextElement/TextElement';
import TitleElement from './TitleElement/TitleElement';

export const renderers = [
  ...vanillaRenderers,
  {
    tester: rankWith(20, isStringControl),
    renderer: InputTextControl,
  },
  {
    tester: rankWith(20, isBooleanControl),
    renderer: CheckboxControl,
  },
  {
    tester: rankWith(30, and(isControl, optionIs('isSecure', true))),
    renderer: InputPasswordControl,
  },
  {
    tester: rankWith(50, uiTypeIs('Image')),
    renderer: ImageElement,
  },
  {
    tester: rankWith(50, uiTypeIs('Divider')),
    renderer: DividerElement,
  },
  {
    tester: rankWith(50, and(uiTypeIs('Label'), or(optionIs('style', LabelStyle.HEADLINE), optionIs('style', LabelStyle.TITLE_2)))),
    renderer: TitleElement,
  },
  {
    tester: rankWith(50, and(uiTypeIs('Label'), optionIs('style', LabelStyle.BODY))),
    renderer: TextElement,
  },
  {
    tester: rankWith(
      60,
      and(
        uiTypeIs('Action'),
        or(
          optionIs('style', ActionStyle.PRIMARY_BUTTON),
          optionIs('style', ActionStyle.SECONDARY_BUTTON),
        ),
        or(optionIs('event', ActionEvent.PERFORM_STEP), optionIs('event', ActionEvent.REDIRECT)),
      ),
    ),
    renderer: ButtonElement,
  },
  {
    tester: rankWith(60, and(uiTypeIs('Action'), optionIs('style', ActionStyle.LINK), or(optionIs('event', ActionEvent.REDIRECT), optionIs('event', ActionEvent.REDIRECT_BLANK)))),
    renderer: LinkElement,
  },
  {
    tester: rankWith(60, and(uiTypeIs('Action'), optionIs('style', ActionStyle.LINK_BUTTON), optionIs('event', ActionEvent.PERFORM_STEP))),
    renderer: LinkButtonElement,
  },
  // {
  //   tester: rankWith(11, and(
  //     optionIs('format', 'button'),
  //     optionIs('type', 'signInWithFastPass'),
  //   )),
  //   renderer: withJsonFormsControlProps(FastPassButtonControl),
  // },
  // {
  //   tester: rankWith(11, uiTypeIs('Heading')),
  //   renderer: HeadingControl,
  // },
  // {
  //   tester: rankWith(12, optionIs('type', 'hidden')),
  //   renderer: withJsonFormsControlProps(InputTextHiddenControl),
  // },
];
