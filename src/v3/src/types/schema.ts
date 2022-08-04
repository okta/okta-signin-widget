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
  IdxMessage,
  IdxTransaction,
  Input,
  NextStep,
  WebauthnVerificationValues,
} from '@okta/okta-auth-js';
import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { FunctionComponent } from 'preact';

import { IWidgetContext } from './context';
import { ClickHandler } from './handlers';
import { ListItem, PasswordSettings } from './password';
import { UserInfo } from './userInfo';

type GeneralDataSchemaBag = Record<string, DataSchema>;

export type FormBag = {
  schema: Record<string, unknown>;
  uischema: UISchemaLayout;
  data: Record<string, unknown>;
  // temp schema bag to handle client validation and form submission
  dataSchema: GeneralDataSchemaBag & {
    submit: ActionOptions;
    fieldsToValidate: string[];
  }
};

export type AutoCompleteValue = 'username'
| 'current-password'
| 'one-time-code'
| 'new-password'
| 'tel-national'
| 'given-name'
| 'family-name'
| 'email';

export type InputAttributes = { autocomplete?: AutoCompleteValue; };

// flat params
export type ActionParams = {
  [key: string]: string | boolean | number;
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

export interface UISchemaElement {
  type: string;
  label?: string;
}

export interface UISchemaLayout {
  type: UISchemaLayoutType;
  elements: (UISchemaElement | UISchemaLayout | StepperLayout)[];
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
}

export function isUISchemaLayoutType(type: string): boolean {
  return Object.values(UISchemaLayoutType).includes(type as UISchemaLayoutType);
}

export interface FieldElement extends UISchemaElement {
  type: 'Field';
  // TODO: only use limited field as i18n field
  options: {
    inputMeta: Input;
    format?: string;
    attributes?: InputAttributes;
    defaultOption?: string | number | boolean;
    type?: string;
    customOptions?: IdxOption[],
    targetKey?: string;
    translations?: TranslationInfo[];
    dataSe?: string;
  };
}

export interface InputTextElement extends FieldElement {
  options: FieldElement['options'] & {
    attributes: InputAttributes;
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
  };
}

export interface AuthenticatorButtonElement {
  type: 'AuthenticatorButton';
  label: string;
  options: Omit<ButtonElement['options'], 'type' | 'step'> & {
    key: string;
    ctaLabel: string;
    description?: string;
    usageDescription?: string;
  };
}

export interface WebAuthNButtonElement extends UISchemaElement {
  type: 'WebAuthNSubmitButton';
  options: {
    label: string;
    step: string;
    onClick: (() => Promise<WebAuthNEnrollmentPayload>)
    | (() => Promise<WebAuthNVerificationPayload>)
    submitOnLoad?: boolean;
    showLoadingIndicator?: boolean;
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
    level: 1 | 2 | 3 | 4 | 5 | 6;
    visualLevel: 1 | 2 | 3 | 4 | 5 | 6;
    content: string;
  };
}

export interface DescriptionElement extends UISchemaElement {
  type: 'Description';
  options: {
    content: string;
  };
}

export interface TextWithHtmlElement extends UISchemaElement {
  type: 'TextWithHtml';
  options: DescriptionElement['options'] & {
    className: string;
    step: string;
    stepToRender?: string;
  };
}

export interface ReminderElement extends UISchemaElement {
  type: 'Reminder';
  options: {
    /**
     * The call to action text in the reminder content area
     */
    ctaText: string;
    /**
     * Override the default timeout before reminder appears
     */
    timeout?: number;
    linkLabel?: string;
    action?: NextStep['action'];
  };
}

export interface ListElement extends UISchemaElement {
  type: 'List';
  options: {
    items: string[];
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
    fieldKey: string;
    validationDelayMs: number;
  }
}

export interface LinkElement extends UISchemaElement {
  type: 'Link';
  options: ActionOptions & {
    label: string;
    href?: string;
    dataSe?: string;
  };
}

export interface ImageWithTextElement extends UISchemaElement {
  type: 'ImageWithText';
  options: {
    id: string;
    SVGIcon: FunctionComponent;
    textContent: string;
  };
}

export interface QRCodeElement extends UISchemaElement {
  type: 'QRCode';
  options: {
    label: string;
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
    contentType: string;
    title?: string;
    dataSe?: string;
  }
}

export interface SuccessCallback extends UISchemaElement {
  options: {
    data: Record<string, unknown>;
  }
}

export type StepperNavButtonConfigDirection = 'next' | 'prev';

export type StepperNavButtonConfigAttrs = {
  variant?: 'primary' | 'secondary';
  label?: string;
  id?: string;
};

export interface StepperLayout {
  type: UISchemaLayoutType.STEPPER;
  elements: UISchemaLayout[];
  options?: {
    defaultStepIndex: () => number;
  }
}

export interface StepperButtonElement {
  type: 'StepperButton',
  label: string;
  options: Omit<ButtonElement['options'], 'step'>
  & {
    nextStepIndex: number;
  }
}

export interface StepperRadioElement {
  type: 'StepperRadio',
  options: {
    customOptions: Array<IdxOption & {
      key?: string;
      callback: (widgetContext: IWidgetContext, stepIndex: number) => void;
    }>,
    name: string;
    defaultOption: string | number | boolean;
  }
}

export interface RedirectElement extends UISchemaElement {
  type: 'Redirect',
  options: { url: string; },
}

type ValidateFunction = (data: FormBag['data']) => Partial<IdxMessage & { name?: string }>[] | undefined;

export interface DataSchema {
  validate?: ValidateFunction;
}

export interface TranslationInfo {
  name: string;
  i18nKey: string;
  value: string;
}

export interface PasswordWithConfirmationElement extends UISchemaElement {
  type: 'PasswordWithConfirmation';
  options: {
    newPasswordElement: FieldElement,
    confirmPasswordElement: FieldElement,
  };
}
