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
  ControlElement, HorizontalLayout, LabelElement, Layout, UISchemaElement, VerticalLayout,
} from '@jsonforms/core';

import Util from '../../../../util/Util';
import {
  ActionEvent,
  ActionStyle,
  LayoutDirection,
  LayoutElementType,
  TransformStepFnWithOptions,
  UISchemaLayoutType,
} from '../../types';
import { loc } from '../../util';

type ElementTransformer = {
  (element: any, args: {
    uischema: Layout,
  }): void;
};

type ElementTester = {
  tester: (element: any) => boolean,
  element: (element: any) => UISchemaElement,
};

const ElementTesters: ElementTester[] = [
  {
    // image type
    tester: (element: any) => element.type === LayoutElementType.IMAGE,
    element: (element: any) => (
      {
        type: 'Image',
        options: { ...element },
      }
    ),
  },
  {
    // divider type
    tester: (element: any) => element.type === LayoutElementType.DIVIDER,
    element: (element: any) => (
      {
        type: 'Divider',
        options: { ...element },
      }
    ),
  },
  {
    // label type
    tester: (element: any) => element.type === LayoutElementType.LABEL,
    element: (element: any) => (
      {
        type: 'Label',
        text: element.content.text,
        i18n: element.content.i18nKey,
        options: { ...element },
      } as LabelElement
    ),
  },
  {
    // action type
    tester: (element: any) => element.type === LayoutElementType.ACTION,
    element: (element: any) => {
      const isRedirectBtn = element.event === ActionEvent.REDIRECT
        && [ActionStyle.PRIMARY_BUTTON, ActionStyle.SECONDARY_BUTTON].includes(element.style);
      return {
        type: 'Action',
        options: {
          ...element,
          onClick: isRedirectBtn
            ? (() => { Util.redirectWithFormGet(element.target.value); })
            : undefined,
          type: element.target.type,
        },
      };
    },
  },
  {
    // textInput type
    tester: (element: any) => element.type === LayoutElementType.TEXT_INPUT,
    element: (element: any) => (
      {
        type: 'Control',
        scope: `#/properties/${element.name.replace('.', '/properties/')}`,
        label: loc(element.label.content.i18nKey, 'login'),
        options: {
          id: element.id,
          name: element.name,
          requestArgument: element.requestArgument,
          ...element.options,
          label: element.label,
        },
      } as ControlElement
    ),
  },
  {
    // booleanInput type
    tester: (element: any) => element.type === LayoutElementType.BOOLEAN_INPUT,
    element: (element: any) => (
      {
        type: 'Control',
        scope: `#/properties/${element.name.replace('.', '/properties/')}`,
        options: {
          ...element,
        },
      } as ControlElement
    ),
  },
];

const toLayout = (uischema: any): VerticalLayout | HorizontalLayout => {
  const { options } = uischema;
  const layout: Layout = { type: UISchemaLayoutType.VERTICAL, elements: [] };
  if (options) {
    layout.options = options;
  }
  switch (options?.direction) {
    case LayoutDirection.VERTICAL:
      return layout as VerticalLayout;
    case LayoutDirection.HORIZONTAL:
      layout.type = UISchemaLayoutType.HORIZONTAL;
      return layout as HorizontalLayout;
    default:
      return layout as VerticalLayout;
  }
};

const mapUIElement = (element: any, uischema: Layout) => {
  const uiElement = ElementTesters.find(({ tester }) => tester(element));
  if (typeof uiElement === 'undefined') {
    console.error('Found element from server that is not supported in SIW', element);
    return;
  }
  uischema.elements.push(uiElement.element(element));
};

const mapElement: ElementTransformer = (
  element: any,
  { uischema },
) => {
  const { type } = element;

  // When nested, must recursively traverse elements and build layout
  if (type === LayoutElementType.NESTED) {
    const nestedLayout = toLayout(element.layout);
    element.layout.elements.forEach(
      (layoutElement: any) => mapElement(layoutElement, { uischema: nestedLayout }),
    );
    uischema.elements.push(nestedLayout);
  } else {
    mapUIElement(element, uischema);
  }
};

export const generateUISchema: TransformStepFnWithOptions = ({
  transaction, // step: stepName, widgetProps,
}) => (formbag) => {
  // @ts-expect-error layout is missing from type
  const { uischema } = transaction.rawIdxState;
  const primaryLayout = toLayout(uischema);

  uischema.elements.forEach((element: any) => mapElement(element, { uischema: primaryLayout }));
  // eslint-disable-next-line no-param-reassign
  formbag.uischema = primaryLayout;
  return formbag;
};
