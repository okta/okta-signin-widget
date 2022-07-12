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

import { TextInput } from '@okta/odyssey-react';
import { h } from 'preact';

import { useOnChange, useValue } from '../../hooks';
import { useTranslation } from '../../lib/okta-i18n';
import {
  ChangeEvent, InputTextElement, UISchemaElementComponent,
} from '../../types';
import { getLabelName } from '../helpers';

const InputText: UISchemaElementComponent<{
  type: string;
  uischema: InputTextElement;
}> = ({ uischema, type }) => {
  const { t } = useTranslation();
  const value = useValue(uischema);
  const onChangeHandler = useOnChange(uischema);
  const { label } = uischema;
  const {
    attributes,
    inputMeta: {
      // @ts-ignore expose type from auth-js
      messages = {},
      name,
    },
  } = uischema.options;
  const messageI18nObj = (messages.value || [])[0]?.i18n;
  const error = t(messageI18nObj?.key, messageI18nObj?.params);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChangeHandler(e.target.value);
  };

  return (
    <TextInput
      error={error}
      type={type || 'text'}
      name={name}
      id={name}
      data-se={name}
      label={t(getLabelName(label!))}
      value={value}
      onChange={handleChange}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...attributes}
    />
  );
};

export default InputText;
