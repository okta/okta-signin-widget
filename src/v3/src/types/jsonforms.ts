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
  CellProps,
  ControlElement,
  ControlProps,
  JsonSchema7,
  Layout,
  UISchemaElement,
} from '@jsonforms/core';
import { JsonFormsStateContext } from '@jsonforms/react';
import { IdxTransaction, NextStep } from '@okta/okta-auth-js';
import { FunctionComponent, h } from 'preact';
import { PasswordRequirementsData } from 'src/components/renderers/passwordRequirementsControl/passwordRequirementsData';

import { IonFormField } from './ion';
import { JsonObject } from './json';
import { UserInfo } from './userInfo';

export type InputType = 'hidden' | 'password';

export enum LayoutType {
  CATEGORIZATION = 'Categorization',
  CATEGORY = 'Category',
  GROUP = 'Group',
  HORIZONTAL = 'HorizontalLayout',
  STEPPER = 'Stepper',
  VERTICAL = 'VerticalLayout',
}

export enum MessageType {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
}
export type MessageVariant = 'danger' | 'caution' | 'info' | 'success';
export const MessageTypeVariant: Record<MessageType, MessageVariant> = {
  ERROR: 'danger',
  WARNING: 'caution',
  INFO: 'info',
  SUCCESS: 'success',
};

// Utility that asserts a specific key of an object non-optional
export type RequiredKeys<T, K extends keyof T> = Exclude<T, K> & Required<Pick<T, K>>;

// Utility to modify interfaces / types
export type Modify<T, R> = Omit<T, keyof R> & R;

export type FormEnvelope = {
  method?: string;
  href?: string;
  name?: string;
  headers?: Record<string, string>;
};

export type FormBag = {
  envelope?: FormEnvelope;
  schema: JsonSchema7;
  uischema: Layout;
  data: JsonObject;
};

export type TransformedResponse = {
  remediation?: FormBag[];
  cancel?: FormBag;
};

export interface WithDefaultValue<T = unknown> {
  default: T;
}

export type IdxTransactionWithNextStep = Modify<IdxTransaction, {
  nextStep: NextStep;
}>;

export type IdxStepTransformer = (
  transaction: IdxTransactionWithNextStep,
  formBag: FormBag,
) => FormBag;

export type FieldTransformer<U = JsonObject, T = unknown> = (input: IonFormField<T>) => U | null;

export type StepTransformer = (step?: NextStep) => FormBag;

export type UISchemaOptions = {
  [key: string]: unknown;
};

export type Choice = {
  key: string;
  value: string;
};
export type Option<T = unknown> = {
  key: string;
  label?: string;
  description?: string,
  value: T;
};
export type SelectOption = Option;
export type AuthenticatorOptionValue = {
  label: string;
  key?: string,
  id?: string,
  methodType?: string,
  enrollmentId?: string,
  authenticatorId?: string,
};

export type RendererComponent<T> = {
  (props: T): h.JSX.Element;
  displayName: string;
  name?: string;
};

export type WrappedFunctionComponent<T> = (Component: FunctionComponent<T>) => RendererComponent<T>;

export type CellPropsWithContext = { ctx: JsonFormsStateContext, props: CellProps };
export type ControlPropsAndContext = {
  ctx: JsonFormsStateContext,
  props: ControlPropsWithFormValidationState
};
export interface ControlPropsWithFormValidationState extends ControlProps {
  dirty?: boolean;
  setDirty?: (dirty: boolean) => void;
  pristine?: boolean;
  setPristine?: (pristine: boolean) => void;
  touched?: boolean;
  setTouched?: (touched: boolean) => void;
  untouched?: boolean;
  setUntouched?: (untouched: boolean) => void;
}

export interface TitleElement extends UISchemaElement {
  type: 'Title';
  options: {
    content: string;
  };
}

export interface DescriptionElement extends UISchemaElement {
  type: 'Description';
  options: {
    content: string;
    contentParams?: string[];
  }
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

export interface PasswordRequirementsElement extends ControlElement {
  options: {
    format: 'PasswordRequirements';
    userInfo: UserInfo;
    data: PasswordRequirementsData;
    fieldKey: string;
    validationDelayMs: number;
  }
}

export interface LinkElement extends UISchemaElement {
  type: 'Link';
  options: {
    label: string;
    href: string;
  };
}

export interface ImageWithTextElement extends ControlElement {
  options: {
    format: 'ImageWithText';
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

export interface PollingElement extends UISchemaElement {
  type: 'Polling';
  options: {
    refresh: number;
    idxMethod: 'poll';
    skipValidation: boolean;
  };
}

export interface InfoboxElement extends UISchemaElement {
  type: 'InfoBox';
  options: {
    contentType: 'string' | 'list';
    class: MessageVariant;
    message: string;
    title?: string;
  };
}

export type StepperNavButtonConfigDirection = 'next' | 'prev';

export type StepperNavButtonConfigAttrs = {
  variant?: 'primary' | 'clear';
  label?: string;
};

export interface StepperLayout extends Layout {
  type: 'Stepper';
  options: {
    key: string;
    navButtonsConfig: Record<StepperNavButtonConfigDirection, StepperNavButtonConfigAttrs>;
  };
}
