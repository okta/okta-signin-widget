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
  FormLabel,
  Radio as RadioMui,
  RadioGroup,
} from '@mui/material';
import { IdxOption } from '@okta/okta-auth-js/idx';
import { h } from 'preact';

import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useOnChange, useValue } from '../../hooks';
import {
  ChangeEvent,
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { getTranslation } from '../../util';
import FieldErrorContainer from '../FieldErrorContainer';
import { withFormValidationState } from '../hocs';

const Radio: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  uischema,
  setTouched,
  errors,
  setErrors,
  onValidateHandler,
  describedByIds,
}) => {
  const value = useValue(uischema);
  const { loading } = useWidgetContext();
  const onChangeHandler = useOnChange(uischema);
  const {
    required,
    translations = [],
    options: {
      inputMeta: {
        name,
        options,
      },
      customOptions,
    },
    focus,
  } = uischema;
  const label = getTranslation(translations, 'label');
  const focusRef = useAutoFocus<HTMLInputElement>(focus);
  const hasErrors = typeof errors !== 'undefined';

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTouched?.(true);
    onChangeHandler(e.currentTarget.value);
    onValidateHandler?.(setErrors, e.currentTarget.value);
  };

  return (
    <FormControl
      component="fieldset"
      required={required}
      error={hasErrors}
    >
      {label && (<FormLabel>{label}</FormLabel>)}
      <RadioGroup
        name={name}
        id={name}
        data-se={name}
        aria-describedby={describedByIds}
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
              disabled={loading}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...(index === 0 && { inputRef: focusRef } )}
            />
          ))
        }
      </RadioGroup>
      {hasErrors && (
        <FieldErrorContainer
          errors={errors}
          fieldName={name}
        />
      )}
    </FormControl>
  );
};

export default withFormValidationState(Radio);
