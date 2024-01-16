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
  IdxTransaction,
  Input,
} from '@okta/okta-auth-js';
import { FunctionComponent, h } from 'preact';

import { JsonObject } from './json';
import { FormBag } from './schema';
import { UISchemaElement } from '@jsonforms/core';

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
export type MessageVariant = 'error' | 'warning' | 'info' | 'success';
export const MessageTypeVariant: Record<MessageType, MessageVariant> = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success',
};

// Utility that asserts a specific key of an object non-optional
export type RequiredKeys<T, K extends keyof T> = Exclude<T, K> & Required<Pick<T, K>>;

// Utility to modify interfaces / types
export type Modify<T, R> = Omit<T, keyof R> & R;

export type TransformedResponse = {
  remediation?: FormBag[];
  cancel?: FormBag;
};

export interface WithDefaultValue<T = unknown> {
  default: T;
}

export type FieldTransformer<U = JsonObject, T = Input> = (input: T) => U | null;

export type TerminalKeyTransformer = (transaction: IdxTransaction, formBag: FormBag) => FormBag;

export type UISchemaOptions = {
  [key: string]: unknown;
};

export type Choice = {
  key: string;
  value: string;
};

export type RendererComponent<T> = {
  (props: T): h.JSX.Element;
  displayName: string;
  name?: string;
};

export type WrappedFunctionComponent<T> = (Component: FunctionComponent<T>) => RendererComponent<T>;

export interface ControlPropsWithFormValidationState {
  dirty?: boolean;
  setDirty?: (dirty: boolean) => void;
  pristine?: boolean;
  setPristine?: (pristine: boolean) => void;
  touched?: boolean;
  setTouched?: (touched: boolean) => void;
  untouched?: boolean;
  setUntouched?: (untouched: boolean) => void;
}
