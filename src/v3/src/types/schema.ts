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
  IdxAuthenticator,
  IdxMessage,
  IdxTransaction,
  Input,
  WebauthnVerificationValues,
} from '@okta/okta-auth-js';
import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { ComponentType, FunctionComponent } from 'preact';

import { IStepperContext, IWidgetContext } from './context';
import { ClickHandler } from './handlers';
import { ListItem, PasswordSettings } from './password';
import { UserInfo } from './userInfo';

type GeneralDataSchemaBag = Record<string, DataSchema>;

export type DataSchemaBag = GeneralDataSchemaBag & {
  submit: ActionOptions;
  fieldsToTrim: string[];
  fieldsToValidate: string[];
  fieldsToExclude: (data: FormBag['data']) => string[];
};

export type FormBag = {
  schema: Record<string, unknown>;
  uischema: UISchemaLayout;
  data: Record<string, unknown>;
  // temp schema bag to handle client validation and form submission
  dataSchema: DataSchemaBag;
};

export type IdxMessageWithName = IdxMessage & { name?: string; };

export type AutoCompleteValue = 'username'
| 'current-password'
| 'one-time-code'
| 'new-password'
| 'tel-national'
| 'given-name'
| 'family-name'
| 'email'
| 'off';

export type InputModeValue = 'numeric'
| 'decimal'
| 'tel'
| 'email'
| 'url'
| 'search';

export type InputAttributes = {
  autocomplete?: AutoCompleteValue;
  inputmode?: InputModeValue;
};

// flat params
export type ActionParams = {
  [key: string]: string | boolean | number | null;
};

export interface ActionOptions {
  actionParams?: ActionParams;
  isActionStep?: boolean;
  step: string;
  includeData?: boolean;
  includeImmutableData?: boolean;
}

/**
 * WebAuthNEnrollmentPayload
 */
export type WebAuthNEnrollmentPayload = {
  credentials: {
    /**
     * Represents the client data that was passed
     * to CredentialsContainer.create()
     */
    clientData: string;
    /**
     * BtoA String containing authenticator data and an attestation statement
     * for a newly-created key pair.
     */
    attestation: string;
  }
};

/**
 * WebAuthNVerificationPayload
 */
export type WebAuthNVerificationPayload = {
  credentials: WebauthnVerificationValues
};

export type WebAuthNEnrollmentHandler = (transaction: IdxTransaction) =>
Promise<WebAuthNEnrollmentPayload>;

export type WebAuthNAuthenticationHandler = (transaction: IdxTransaction) =>
Promise<WebAuthNVerificationPayload>;

export type ElementContentType = 'subtitle' | 'footer';

export type LanguageDirection = 'rtl' | 'ltr';

/**
 * @description Token value to search for in a translated string
 */
export type TokenSearchValue = '$1' | '$2';
/**
 * @description Record containing properties to use in the replacement of a translated string
 * @prop {string} element - Target element with which to replace a token
 * @prop {Object} attributes - Object containing any optional attributes that can be added to the target element
 * @prop {string} attributes.class - Class name to apply to the target element
 * @prop {string} attributes.href - href value to apply to the target element
 */
export type TokenReplacementValue = {
  element: 'span' | 'a';
  attributes?: {
    class?: string;
    href?: string;
  };
};

export type TokenReplacement = Partial<Record<TokenSearchValue, TokenReplacementValue>>;

export interface UISchemaElement {
  type: string;
  id?: string;
  key?: string;
  // TODO: make this field required
  translations?: TranslationInfo[];
  /**
   * @deprecated
   */
  label?: string;
  noMargin?: boolean;
  focus?: boolean;
  ariaDescribedBy?: string;
  contentType?: ElementContentType;
  /**
   * Each index of the elements
   * array within {@link StepperLayout} corresponds to a singular view (group of elements).
   * This property maps to / matches the index value of the group of elements in the
   * {@link StepperLayout} elements array. This property allows you to determine which
   * view/step within the {@link StepperLayout} this element belongs to.
   */
  viewIndex?: number;
  noTranslate?: boolean;

  // FIXME make UISchemaElement type generic for options
  options?: any;
}

export interface UISchemaLayout {
  type: UISchemaLayoutType;
  elements: (UISchemaElement | UISchemaLayout | StepperLayout | AccordionLayout)[];
  options?: {
    onClick?: ClickHandler;
  }
}

export type PickerSchema = {
  tester: (schema: UISchemaElement) => boolean;
  mapper?: (schema: UISchemaElement) => UISchemaElement;
};
export interface CustomLayout {
  type: UISchemaLayoutType;
  elements: (CustomLayout | UISchemaElement | PickerSchema)[];
}

export enum UISchemaLayoutType {
  HORIZONTAL = 'HorizontalLayout',
  VERTICAL = 'VerticalLayout',
  STEPPER = 'Stepper',
  ACCORDION = 'Accordion',
}

export function isUISchemaLayoutType(type: string): boolean {
  return Object.values(UISchemaLayoutType).includes(type as UISchemaLayoutType);
}

export interface FieldElement extends UISchemaElement {
  type: 'Field';
  key: string;
  /**
   * @description TODO: OKTA-524769 - temporary solution for custom fields in profile enrollment
   */
  required?: boolean | undefined;
  options: {
    inputMeta: Input;
    format?: 'select' | 'radio';
    attributes?: InputAttributes;
    type?: string;
    customOptions?: IdxOption[],
    dataSe?: string;
  };
}

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type
export enum ButtonType {
  SUBMIT = 'submit',
  BUTTON = 'button',
  RESET = 'reset',
}

// TODO: use type instead of format in tester function
export interface ButtonElement extends UISchemaElement {
  type: 'Button',
  options: ActionOptions & {
    type: ButtonType;
    variant?: 'primary' | 'floating' | 'secondary';
    wide?: boolean;
    deviceChallengeUrl?: string;
    dataType?: 'cancel' | 'save';
    dataSe?: string;
    stepToRender?: string;
    ariaLabel?: string;
    classes?: string;
    Icon?: string;
    onClick?: (widgetContext: IWidgetContext) => unknown;
  };
}

export interface AuthenticatorButtonElement extends UISchemaElement {
  type: 'AuthenticatorButton';
  label: string;
  options: ButtonElement['options'] & {
    key: string;
    authenticator?: IdxAuthenticator;
    ctaLabel: string;
    description?: string;
    usageDescription?: string;
    logoUri?: string;
    iconName?: string;
    iconDescr?: string;
  };
}

export interface AuthenticatorButtonListElement extends UISchemaElement {
  type: 'AuthenticatorButtonList';
  options: { buttons: AuthenticatorButtonElement[] };
}

export interface WebAuthNButtonElement extends UISchemaElement {
  type: 'WebAuthNSubmitButton';
  options: {
    step: string;
    onClick: (() => Promise<WebAuthNEnrollmentPayload>)
    | (() => Promise<WebAuthNVerificationPayload>)
    submitOnLoad?: boolean;
  };
}

export interface PIVButtonElement extends UISchemaElement {
  type: 'PIVButton';
}

export interface LaunchAuthenticatorButtonElement extends UISchemaElement {
  type: 'LaunchAuthenticatorButton';
  options: {
    step: string;
    deviceChallengeUrl?: string;
    challengeMethod?: string;
  };
}

export interface OpenOktaVerifyFPButtonElement extends UISchemaElement {
  type: 'OpenOktaVerifyFPButton';
  options: {
    step: string;
    href?: string;
    challengeMethod?: string;
  };
}

export interface LoopbackProbeElement extends UISchemaElement {
  type: 'LoopbackProbe';
  options: {
    deviceChallengePayload: {
      ports: string[];
      domain: string;
      challengeRequest: string;
      probeTimeoutMillis?: number;
    };
    step: string;
    cancelStep: string;
  };
}

export interface TitleElement extends UISchemaElement {
  type: 'Title';
  options: {
    content: string;
  };
}

export interface HeadingElement extends UISchemaElement {
  type: 'Heading';
  options: {
    // https://mui.com/material-ui/api/typography/
    level: 1 | 2 | 3 | 4 | 5 | 6;
    visualLevel: 1 | 2 | 3 | 4 | 5 | 6;
    content: string;
    dataSe?: string;
  };
}

export interface DescriptionElement extends UISchemaElement {
  type: 'Description';
  options: {
    content: string;
    dataSe?: string;
  };
}

export interface TextWithActionLinkElement extends UISchemaElement {
  type: 'TextWithActionLink';
  options: ActionOptions & {
    content: string;
    contentClassname: string;
    stepToRender?: string;
  };
}

export interface ReminderElement extends UISchemaElement {
  type: 'Reminder';
  options: ActionOptions & {
    /**
     * The call to action text in the reminder content area
     */
    content: string;
    /**
     * Override the default timeout before reminder appears
     */
    contentHasHtml?: boolean;
    timeout?: number;
    buttonText?: string;
    contentClassname?: string;
  };
}

export interface ListElement extends UISchemaElement {
  type: 'List';
  options: {
    /**
     * Items to render in the list.
     *
     * **NOTE**: Only string and UISchemaElement with type
     * 'Button' or 'Description'
     * are supported. Other UISchemaElement types will
     * not render and print a warning to the console.
     */
    items: (string | UISchemaLayout)[],
    type?: 'unordered' | 'ordered' | 'description';
    description?: string;
  };
}

export interface PasswordRequirementsElement extends UISchemaElement {
  type: 'PasswordRequirements',
  options: {
    id: string;
    header: string;
    userInfo: UserInfo;
    settings: PasswordSettings;
    requirements: ListItem[];
    validationDelayMs: number;
  }
}

export interface PasswordMatchesElement extends UISchemaElement {
  type: 'PasswordMatches',
  options: {
    validationDelayMs: number;
  }
}

export interface LinkElement extends UISchemaElement {
  type: 'Link';
  options: ActionOptions & {
    label: string;
    href?: string;
    dataSe?: string;
    onClick?: (widgetContext?: IWidgetContext) => unknown;
  };
}

export interface AccordionPanelElement extends UISchemaElement {
  type: 'AccordionPanel',
  options: {
    id: string;
    summary: string;
    content: Omit<UISchemaLayout, 'AccordionLayout'>;
  };
}

export interface ImageWithTextElement extends UISchemaElement {
  type: 'ImageWithText';
  options: {
    id: string;
    SVGIcon: string;
    textContent?: string;
    alignment?: string;
  };
}

export interface QRCodeElement extends UISchemaElement {
  type: 'QRCode';
  options: {
    data: string;
  };
}

export interface SpinnerElement extends UISchemaElement {
  type: 'Spinner';
  options: {
    label: string;
    valueText: string;
  };
}

export interface InfoboxElement extends UISchemaElement {
  options: {
    message: string;
    class: string;
    title?: string;
    dataSe?: string;
    listOptions?: ListElement['options'];
  }
}

export interface SuccessCallback extends UISchemaElement {
  options: {
    data: Record<string, unknown>;
  }
}

export interface StepperLayout {
  type: UISchemaLayoutType.STEPPER;
  elements: Omit<UISchemaLayout, 'StepperLayout'>[];
  options?: {
    defaultStepIndex: () => number;
  }
}

export interface AccordionLayout {
  type: UISchemaLayoutType.ACCORDION;
  elements: AccordionPanelElement[];
}

export interface StepperButtonElement extends UISchemaElement {
  type: 'StepperButton',
  label: string;
  options: Omit<ButtonElement['options'], 'step'>
  & {
    nextStepIndex: number | ((widgetContext: IWidgetContext) => number);
  }
}

export interface StepperNavigatorElement extends UISchemaElement {
  type: 'StepperNavigator',
  options: {
    callback: (stepperContext: IStepperContext) => void;
  }
}

export interface StepperRadioElement extends UISchemaElement {
  type: 'StepperRadio',
  options: {
    customOptions: Array<IdxOption & {
      key?: string;
      callback: (widgetContext: IWidgetContext, stepIndex: number) => void;
    }>,
    name: string;
    defaultValue: (widgetContext: IWidgetContext, stepIndex: number) => string | number | boolean;
  }
}

export interface RedirectElement extends UISchemaElement {
  type: 'Redirect',
  options: { url: string; },
}

export interface AutoSubmitElement extends UISchemaElement {
  type: 'AutoSubmit',
  options: ActionOptions,
}

export interface HiddenInputElement extends UISchemaElement {
  type: 'HiddenInput';
  options: { name: string; value: string; };
}

type ValidateFunction = (data: FormBag['data']) => IdxMessageWithName[] | undefined;

export interface DataSchema {
  validate?: ValidateFunction;
}

export interface TranslationInfo {
  name: string;
  i18nKey: string;
  value: string;
}

export interface DividerElement extends UISchemaElement {
  type: 'Divider';
  options?: { text: string; };
}
