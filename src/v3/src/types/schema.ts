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

import { PasswordSettings } from './password';
import { UserInfo } from './userInfo';

export type FormBag = {
  schema: Record<string, unknown>;
  uischema: UISchemaLayout;
  data: Record<string, unknown>;
  // temp schema bag to handle client validation and form submission
  dataSchema: Record<string, DataSchema>;

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
  scope?: string; // TODO: remove
  type: string;
  label?: string;
}

export interface UISchemaLayout {
  type: UISchemaLayoutType;
  elements: (UISchemaElement | UISchemaLayout)[];
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

export function isUISchemaLayoutType(type: string) {
  return Object.values(UISchemaLayoutType).includes(type as UISchemaLayoutType);
}

export interface FieldElement extends UISchemaElement {
  name: string; // TODO: strict name as 'Field' when transformer refactor is done
  // TODO: only use limited field as i18n field
  options: {
    inputMeta: Input;
    format?: string;
    attributes?: InputAttributes;
    defaultOption?: string | number | boolean;
    type?: string;
    customOptions?: IdxOption[],
    targetKey?: string;
    isStepper?: boolean;
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
  options: {
    type: ButtonType;
    variant?: 'primary' | 'floating' | 'secondary';
    wide?: boolean;
    deviceChallengeUrl?: string;
    actionParams?: ActionParams;
    includeData?: boolean;
    dataType?: 'cancel' | 'save';
    dataSe?: string;
    step?: string;
    // deprecate this field once auth-js can support `step` for all scenarios
    action?: NextStep['action'];
    actionName?: string;
  };
}

export interface AuthenticatorButtonElement {
  type: 'AuthenticatorButton';
  label: string;
  options: Omit<ButtonElement['options'], 'type'> & {
    key: string;
    ctaLabel: string;
    description?: string;
    descriptionParams?: string[];
  };
}

export interface WebAuthNButtonElement extends UISchemaElement {
  type: 'WebAuthNSubmitButton';
  options: {
    label: string;
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
    contentParams?: string[];
  };
}

export interface HeadingElement extends UISchemaElement {
  type: 'Heading';
  options: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    visualLevel: 1 | 2 | 3 | 4 | 5 | 6;
    content: string;
    contentParams?: string[];
  };
}

export interface DescriptionElement extends UISchemaElement {
  type: 'Description';
  options: {
    content: string;
    contentParams?: string[];
  };
}

export interface ReminderElement extends UISchemaElement {
  type: 'Reminder';
  options: {
    /**
     * The call to action text in the reminder content area
     */
    ctaText: string;
    ctaTextParams?: string[];
    /**
     * Override the default timeout before reminder appears
     */
    timeout?: number;
    // Used to exclude the action section of the InfoBox
    excludeLink?: boolean;
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
    userInfo: UserInfo;
    data: PasswordSettings;
    fieldKey: string;
    validationDelayMs: number;
  }
}

export interface LinkElement extends UISchemaElement {
  type: 'Link';
  options: {
    label: string;
    href?: string;
    actionParams?: ActionParams;
    action: NextStep['action'];
  };
}

export interface ImageWithTextElement extends UISchemaElement {
  type: 'ImageWithText';
  options: {
    id: string;
    SVGIcon: FunctionComponent;
    textContent: string;
    contentParams?: string[];
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
    contentParams?: string[];
    title?: string;
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
}

export interface StepperButtonElement {
  type: 'StepperButton',
  label: string;
  options: ButtonElement['options'] & {
    nextStepIndex: number;
  }
}

export interface StepperRadioElement extends UISchemaElement {
  type: 'StepperRadio',
  options: {
    customOptions: Array<IdxOption & { key?: string; }>,
    id: string;
    defaultOption: string | number | boolean;
  }
}

export interface RedirectElement extends UISchemaElement {
  type: 'Redirect',
  options: { url: string; },
}

type ValidateFunction = (data: FormBag['data']) => Partial<IdxMessage> | undefined;

export interface DataSchema {
  validate?: ValidateFunction;
}
