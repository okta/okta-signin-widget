import { APIError, Input } from '@okta/okta-auth-js';
import {
  SimpleCallback
} from './results';


// Registration

export type FieldType =
  'string' |
  'number' |
  'integer' |
  'boolean' |
  // string with format
  'uri' |
  'email' |
  'country_code' |
  'language_code' |
  'locale' |
  'timezone' |
  // arrays
  'arrayofstring' |
  'arrayofnumber' |
  'arrayofinteger';

interface StringConstraint {
  minLength?: number;
  maxLength?: number;
}
interface NumberConstraint {
  minimum?: number;
  maximum?: number;
}
interface WithDefault<T> {
  default?: T;
}
interface EnumConstraint<T> {
  enum?: Array<T | null>;
  oneOf?: Array<{const: T | null; title: string}>;
}
export interface PasswordConstraints {
  allOf?: Array<PasswordConstraint>;
}
export interface PasswordConstraint {
  description?: string;
  format?: string;
}

export interface FieldBasic {
  type: FieldType;
  title?: string;
  description?: string;
}
export interface FieldString extends FieldBasic, StringConstraint, EnumConstraint<string>, WithDefault<string> {
  type: 'string';
}
export interface FieldStringWithFormat extends FieldBasic, WithDefault<string> {
  type:
    'uri' |
    'email';
}
export interface FieldStringWithFormatAndEnum extends FieldBasic, EnumConstraint<string>, WithDefault<string> {
  type:
    'country_code' |
    'language_code' |
    'locale' |
    'timezone';
}
export interface FieldPassword extends FieldBasic, StringConstraint, PasswordConstraints, WithDefault<string> {
  type: 'string';
}
export interface FieldNumber extends FieldBasic, NumberConstraint, EnumConstraint<number>, WithDefault<number> {
  type: 'number' | 'integer';
}
export interface FieldBoolean extends FieldBasic, EnumConstraint<boolean>, WithDefault<boolean> {
  type: 'boolean';
}
export interface FieldArray extends FieldBasic {
  type: 'arrayofstring' | 'arrayofinteger' | 'arrayofnumber';
}

export type Field =
  FieldString |
  FieldStringWithFormat |
  FieldStringWithFormatAndEnum |
  FieldPassword |
  FieldNumber |
  FieldBoolean |
  FieldArray;

/**
 * Schema element used in OIE (Identity Engine) registration flows.
 * In OIE mode, the parseSchema callback receives an array of these elements
 * rather than a single RegistrationSchema object.
 *
 * This type extends the Input type from @okta/okta-auth-js, which represents
 * an IDX remediation input field. At runtime, the widget converts Input[]
 * into RegistrationElementSchema[] by spreading each Input and adding
 * UI-specific properties ('label-top', 'data-se', 'wide', etc.).
 */
export interface RegistrationElementSchema extends Input {
  'label-top'?: boolean;
  placeholder?: string;
  'data-se'?: string;
  sublabel?: string;
  wide?: boolean;
}

export interface RegistrationSchema {
  lastUpdate: number;
  policyId: string;
  profileSchema: {
    properties: {
      [key: string]: Field;
    };
    required: Array<string>;
    fieldOrder: Array<string>;
  };
}

type FieldValue = string | boolean | number | Array<string | number> | null;

export interface RegistrationData {
  [key: string]: FieldValue;
}

export type RegistrationSchemaCallback = (schema: RegistrationSchema | RegistrationElementSchema[]) => void;
export type RegistrationDataCallback = (data: RegistrationData) => void;
export type RegistrationPostSubmitCallback = (response: string) => void;
export type RegistrationErrorCallback = (error: APIError) => void
export interface RegistrationOptions {
  click?: SimpleCallback;
  parseSchema?: (
    schema: RegistrationSchema | RegistrationElementSchema[],
    onSuccess: RegistrationSchemaCallback,
    onFailure: RegistrationErrorCallback
  ) => void;
  preSubmit?: (
    postData: RegistrationData,
    onSuccess: RegistrationDataCallback,
    onFailure: RegistrationErrorCallback
  ) => void;
  postSubmit?: (
    response: string,
    onSuccess: RegistrationPostSubmitCallback,
    onFailure: RegistrationErrorCallback
  ) => void;
}
