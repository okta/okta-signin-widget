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

import { useAutoFocus, useOnChange, useValue } from '../../hooks';
import {
  ChangeEvent,
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { withFormValidationState } from '../hocs';

const Radio: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  uischema,
  setTouched,
  error,
  setError,
  onValidateHandler,
}) => {
  const value = useValue(uischema);
  const onChangeHandler = useOnChange(uischema);
  const {
    label,
    options: {
      inputMeta: {
        name,
        required,
        options,
      },
      customOptions,
    },
    focus,
  } = uischema;
  const focusRef = useAutoFocus<HTMLInputElement>(focus);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTouched?.(true);
    onChangeHandler(e.currentTarget.value);
    onValidateHandler?.(setError, e.currentTarget.value);
  };

  return (
    <FormControl
      component="fieldset"
      required={required}
      error={!!error}
    >
      {label && (<FormLabel>{label!}</FormLabel>)}
      <RadioGroup
        name={name}
        id={name}
        aria-describedby={error && `${name}-error`}
        value={value as string ?? ''}
        onChange={handleChange}
      >
        {
          (customOptions ?? options)?.map((item: IdxOption, index: number) => (
            <FormControlLabel
              control={<RadioMui />}
              key={item.value}
              value={item.value}
              label={item.label}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...(index === 0 && { inputRef: focusRef } )}
            />
          ))
        }
      </RadioGroup>
      {error && (
        <FormHelperText
          id={`${name}-error`}
          role="alert"
          data-se={`${name}-error`}
          error
        >
          {error}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default withFormValidationState(Radio);
