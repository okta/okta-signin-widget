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

import { Input } from '@okta/okta-auth-js';

import { FieldElement } from '../types';

export const isCheckboxFieldElement = ({
  options: { inputMeta: { type } = {} as Input },
}: FieldElement): boolean => (
  typeof type !== 'undefined' && ['boolean', 'checkbox'].includes(type)
);

export const isInputTextFieldElement = ({
  options: {
    type: defaultType,
    inputMeta: {
      type, options, name, secret,
    } = {} as Input,
  },
}: FieldElement): boolean => (
  ((type === 'string' || defaultType === 'string') && !options && !secret)
      || (name === 'credentials.passcode' && !secret)
);

export const isPhoneNumberElement = ({
  options: { inputMeta: { name } = {} as Input } = {} as FieldElement['options'],
}: FieldElement): boolean => (name?.endsWith('phoneNumber'));

export const isRadioFieldElement = ({
  options: {
    inputMeta: { options, type } = {} as Input,
    format,
    customOptions,
  },
}: FieldElement): boolean => (
  Array.isArray(customOptions) || Array.isArray(options)) && ([format, type].includes('radio')
);

export const isSelectFieldElement = ({
  options: {
    inputMeta: { options, type } = {} as Input,
    format,
    customOptions,
  },
}: FieldElement): boolean => (
  (Array.isArray(customOptions) || Array.isArray(options) || typeof options === 'object')
  && [format, type].includes('select')
);
