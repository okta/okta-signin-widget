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
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio as RadioMui,
  RadioGroup,
} from '@mui/material';
import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { h } from 'preact';
import { ChangeEvent, FieldElement, UISchemaElementComponent } from 'src/types';
import { getMessage } from '../../../../v2/ion/i18nTransformer';

import { useOnChange, useValue } from '../../hooks';
import { getLabelName } from '../helpers';

const Radio: UISchemaElementComponent<{
  uischema: FieldElement
}> = ({ uischema }) => {
  const value = useValue(uischema);
  const onChangeHandler = useOnChange(uischema);
  const {
    label,
    options: {
      inputMeta: {
        // @ts-ignore expose type from auth-js
        messages = {},
        name,
        options,
      },
      customOptions,
    },
  } = uischema;
  const error = messages?.value?.[0] && getMessage(messages.value[0]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChangeHandler(e.currentTarget.value);
  };

  return (
    <FormControl
      component="fieldset"
      error={error !== ''}
    >
      {label && (<FormLabel>{getLabelName(label!)}</FormLabel>)}
      <RadioGroup
        name={name}
        id={name}
        value={value as string ?? ''}
        onChange={handleChange}
      >
        {
          (customOptions ?? options)?.map((item: IdxOption) => (
            <FormControlLabel
              control={<RadioMui />}
              key={item.value}
              value={item.value}
              label={item.label}
            />
          ))
        }
      </RadioGroup>
      {error && (
        <FormHelperText>{error}</FormHelperText>
      )}
    </FormControl>
  );
};

export default Radio;
