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

import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useOnChange, useValue } from '../../hooks';
import {
  ChangeEvent, UISchemaElementComponent, UISchemaElementComponentWithValidationProps,
} from '../../types';
import { getTranslation } from '../../util';
import FieldErrorContainer from '../FieldErrorContainer';
import { withFormValidationState } from '../hocs';

const InputText: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  type,
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
  const { translations = [], focus, required } = uischema;
  const label = getTranslation(translations);
  const hint = getTranslation(translations, 'hint');
  const {
    attributes,
    inputMeta: { name },
    dataSe,
  } = uischema.options;
  const focusRef = useAutoFocus<HTMLInputElement>(focus);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched?.(true);
    onChangeHandler(e.currentTarget.value);
    onValidateHandler?.(setErrors, e.currentTarget.value);
  };

  return (
    <Box>
      <InputLabel
        htmlFor={name}
        required={required}
      >
        {label}
      </InputLabel>
      { hint && <FormHelperText data-se={`${name}-hint`}>{hint}</FormHelperText> }
      <OutlinedInput
        value={value}
        type={type || 'text'}
        id={name}
        name={name}
        error={errors !== undefined}
        onChange={handleChange}
        disabled={loading}
        fullWidth
        inputProps={{
          'data-se': dataSe,
          'aria-describedby': describedByIds,
          ...attributes,
        }}
        inputRef={focusRef}
      />
      {errors !== undefined && (
        <FieldErrorContainer
          errors={errors}
          fieldName={name}
        />
      )}
    </Box>
  );
};

export default withFormValidationState(InputText);
