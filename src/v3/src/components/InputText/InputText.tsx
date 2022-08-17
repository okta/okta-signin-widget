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
  Box,
  FormHelperText,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import { h } from 'preact';

import { getMessage } from '../../../../v2/ion/i18nTransformer';
import { useOnChange, useValue } from '../../hooks';
import {
  ChangeEvent,
  FieldElement,
  UISchemaElementComponent,
} from '../../types';
import { getTranslation } from '../../util';

const InputText: UISchemaElementComponent<{
  type: string;
  uischema: FieldElement;
}> = ({ uischema, type }) => {
  const value = useValue(uischema);
  const onChangeHandler = useOnChange(uischema);
  const { translations = [] } = uischema;
  const label = getTranslation(translations);
  const hint = getTranslation(translations, 'hint');
  const {
    attributes,
    inputMeta: {
      // @ts-ignore expose type from auth-js
      messages = {},
      name,
    },
    dataSe,
  } = uischema.options;
  const error = messages?.value?.[0] && getMessage(messages.value[0]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChangeHandler(e.currentTarget.value);
  };

  return (
    <Box>
      <InputLabel htmlFor={name}>{label}</InputLabel>
      { hint && <FormHelperText data-se={`${name}-hint`}>{hint}</FormHelperText> }
      <OutlinedInput
        value={value}
        type={type || 'text'}
        id={name}
        name={name}
        error={error !== undefined}
        onChange={handleChange}
        fullWidth
        inputProps={{
          'data-se': dataSe,
          ...attributes,
        }}
      />
      {error && (
        <FormHelperText
          data-se={`${dataSe}-error`}
          error
        >
          {error}
        </FormHelperText>
      )}
    </Box>
  );
};

export default InputText;
