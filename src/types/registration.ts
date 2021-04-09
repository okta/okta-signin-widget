import {
  SimpleCallback
} from './api';


// Registration

type FieldType =
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
interface PasswordConstraints {
  allOf?: Array<PasswordConstraint>;
}
interface PasswordConstraint {
  description?: string;
  format?: string;
}

interface FieldBasic {
  type: FieldType;
  title?: string;
  description?: string;
}
interface FieldString extends FieldBasic, StringConstraint, EnumConstraint<string>, WithDefault<string> {
  type: 'string';
}
interface FieldStringWithFormat extends FieldBasic, WithDefault<string> {
  type:
    'uri' |
    'email';
}
interface FieldStringWithFormatAndEnum extends FieldBasic, EnumConstraint<string>, WithDefault<string> {
  type:
    'country_code' |
    'language_code' |
    'locale' |
    'timezone';
}
interface FieldPassword extends FieldBasic, StringConstraint, PasswordConstraints, WithDefault<string> {
  type: 'string';
}
interface FieldNumber extends FieldBasic, NumberConstraint, EnumConstraint<number>, WithDefault<number> {
  type: 'number' | 'integer';
}
interface FieldBoolean extends FieldBasic, EnumConstraint<boolean>, WithDefault<boolean> {
  type: 'boolean';
}
interface FieldArray extends FieldBasic {
  type: 'arrayofstring' | 'arrayofinteger' | 'arrayofnumber';
}

type Field =
  FieldString |
  FieldStringWithFormat |
  FieldStringWithFormatAndEnum |
  FieldPassword |
  FieldNumber |
  FieldBoolean |
  FieldArray;

interface Schema {
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

interface Data {
  [key: string]: FieldValue;
}

export interface Callbacks {
  click?: SimpleCallback;
  parseSchema?: (
    schema: Schema,
    onSuccess: (schema: Schema) => void,
    onFailure: (error: Error) => void
  ) => void;
  preSubmit?: (
    postData: Data,
    onSuccess: (schema: Data) => void,
    onFailure: (error: Error) => void
  ) => void;
  postSubmit?: (
    response: string,
    onSuccess: (response: string) => void,
    onFailure: (error: Error) => void
  ) => void;
}

