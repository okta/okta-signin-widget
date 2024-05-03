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
  ActionType,
  LayoutDirection,
  LayoutElementType,
  TransformStepFnWithOptions,
  UIEventType,
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
  buildElement: (element: any) => UISchemaElement,
};

const ElementTesters: ElementTester[] = [
  {
    // image type
    tester: (element: any) => element.type === LayoutElementType.IMAGE,
    buildElement: (element: any) => (
      {
        type: 'Image',
        options: { ...element },
      }
    ),
  },
  {
    // divider type
    tester: (element: any) => element.type === LayoutElementType.DIVIDER,
    buildElement: (element: any) => (
      {
        type: 'Divider',
        options: {
          ...element,
          label: element.label && loc(element.label.content.i18nKey, 'login', element.label.content.parameters, element.label.content.labelFormatter),
        },
      }
    ),
  },
  {
    // Label with action type
    tester: (element: any) => element.type === LayoutElementType.LABEL
      && element.content.labelFormatter
      && Object.keys(element.content.labelFormatter).some((formatterKey) => element.content.labelFormatter?.[formatterKey]?.attributes?.events?.some((formatEvent: any) => formatEvent.type === UIEventType.ON_CLICK)),
    buildElement: (element: any) => {
      const linkActionKey: any = Object.keys(element.content.labelFormatter).find((formatterKey) => element.content.labelFormatter?.[formatterKey]?.attributes?.events?.some((formatEvent: any) => formatEvent.type === UIEventType.ON_CLICK));
      element.content.labelFormatter[linkActionKey] = {
        ...element.content.labelFormatter[linkActionKey],
        attributes: {
          ...element.content.labelFormatter[linkActionKey].attributes,
          class: element.content.labelFormatter[linkActionKey].attributes.htmlClass,
        },
      };
      const linkAction = element.content.labelFormatter[linkActionKey];
      const linkActionEvent = linkAction?.attributes?.events.find((formatEvent:any) => formatEvent.type === UIEventType.ON_CLICK);
      return {
        type: 'TextWithActionLink',
        text: loc(element.content.i18nKey, 'login', element.content.parameters, element.content.labelFormatter),
        i18n: element.content.i18nKey,
        options: {
          ...element,
          content: loc(element.content.i18nKey, 'login', element.content.parameters, element.content.labelFormatter),
          // actionParams,
          step: linkActionEvent?.action.step,
          contentClassname: linkAction?.attributes.class,
          isActionStep: linkActionEvent?.action.action,
          parserOptions: {},
        },
      };
    },
  },
  {
    // label type
    tester: (element: any) => element.type === LayoutElementType.LABEL,
    buildElement: (element: any) => (
      {
        type: 'Label',
        text: loc(element.content.i18nKey, 'login', element.content.parameters, element.content.labelFormatter),
        i18n: element.content.i18nKey,
        options: { ...element, label: loc(element.content.i18nKey, 'login', element.content.parameters, element.content.labelFormatter) },
      } as LabelElement
    ),
  },
  {
    // OVFP Button type
    tester: (element: any) => element.type === LayoutElementType.BUTTON && element.events?.[0]?.action?.step === 'launch-authenticator',
    buildElement: (element: any) => {
      return {
        type: 'LaunchAuthenticatorButton',
        options: {
          ...element,
          label: loc(element.label.content.i18nKey, 'login', element.label.content.parameters, element.label.content.labelFormatter),
          step: element.events?.[0]?.action?.step,
          deviceChallengeUrl: element.events?.[0]?.action?.deviceChallengeUrl,
          challengeMethod: element.events?.[0]?.action?.challengeMethod,
        },
      };
    },
  },
  {
    // Button type
    tester: (element: any) => element.type === LayoutElementType.BUTTON,
    buildElement: (element: any) => {
      const isRedirectBtn = element.events?.[0]?.action?.type === ActionType.OPEN_URL;
      return {
        type: 'Button',
        options: {
          ...element,
          label: loc(element.label.content.i18nKey, 'login', element.label.content.parameters, element.label.content.labelFormatter),
          onClick: isRedirectBtn
            ? (() => { Util.redirectWithFormGet(element.events?.[0]?.action?.url); })
            : undefined,
          type: isRedirectBtn && 'Button',
        },
      };
    },
  },
  {
    // Link type
    tester: (element: any) => element.type === LayoutElementType.LINK && element.events?.[0]?.action?.type === ActionType.OPEN_URL,
    buildElement: (element: any) => {
      return {
        type: 'Link',
        options: {
          ...element,
          label: loc(element.label.content.i18nKey, 'login', element.label.content.parameters, element.label.content.labelFormatter),
          target: element.events?.[0]?.action?.newWindow && '_blank',
          url: element.events?.[0]?.action?.url,
        },
      };
    },
  },
  {
    // Link Button type
    tester: (element: any) => element.type === LayoutElementType.LINK && element.events?.[0]?.action?.type !== ActionType.OPEN_URL,
    buildElement: (element: any) => {
      return {
        type: 'LinkButton',
        options: {
          ...element,
          label: loc(element.label.content.i18nKey, 'login', element.label.content.parameters, element.label.content.labelFormatter),
          isActionStep: element.events?.[0]?.action?.action,
          step: element.events?.[0]?.action?.step,
        },
      };
    },
  },
  {
    // textInput type
    tester: (element: any) => element.type === LayoutElementType.TEXT_INPUT,
    buildElement: (element: any) => (
      {
        type: 'Control',
        scope: `#/properties/${element.name.replace('.', '/properties/')}`,
        label: loc(element.label.content.i18nKey, 'login', element.label.content.parameters, element.label.content.labelFormatter),
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
    buildElement: (element: any) => (
      {
        type: 'Control',
        scope: `#/properties/${element.name.replace('.', '/properties/')}`,
        options: {
          ...element,
          label: loc(element.label.content.i18nKey, 'login', element.label.content.parameters, element.label.content.labelFormatter),
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
  const elementTester = ElementTesters.find(({ tester }) => tester(element));
  if (typeof elementTester === 'undefined') {
    console.error('Found element from server that is not supported in SIW', element);
    return;
  }
  uischema.elements.push(elementTester.buildElement(element));
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
  const { rootLayout } = transaction.rawIdxState;
  const primaryLayout = toLayout(rootLayout);

  rootLayout.elements.forEach((element: any) => mapElement(element, { uischema: primaryLayout }));
  // eslint-disable-next-line no-param-reassign
  formbag.uischema = primaryLayout;
  return formbag;
};
