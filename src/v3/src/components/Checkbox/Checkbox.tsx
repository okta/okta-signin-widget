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
  Checkbox as CheckboxMui,
  FormControl,
  FormControlLabel,
} from '@mui/material';
import { h } from 'preact';
import {
  ChangeEvent,
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from 'src/types';

import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useOnChange, useValue } from '../../hooks';
import { getTranslation } from '../../util';
import FieldErrorContainer from '../FieldErrorContainer';
import { withFormValidationState } from '../hocs';

const Checkbox: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
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

  const { options: { inputMeta: { name } }, focus, required } = uischema;
  const label = getTranslation(uischema.translations!);
  const focusRef = useAutoFocus<HTMLInputElement>(focus);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTouched?.(true);
    onChangeHandler(e.currentTarget.checked);
    onValidateHandler?.(setErrors, e.currentTarget.checked);
  };

  return (
    <FormControl
      component="fieldset"
      required={required}
      error={errors !== undefined}
      aria-describedby={describedByIds}
    >
      <FormControlLabel
        control={(
          <CheckboxMui
            size="medium"
            checked={value === true}
            id={name}
            name={name}
            inputRef={focusRef}
            onChange={handleChange}
            disabled={loading}
            inputProps={{
              'data-se': name,
              'data-se-for-name': name,
            }}
          />
        )}
        label={label as string}
      />
      {errors !== undefined && (
        <FieldErrorContainer
          errors={errors}
          fieldName={name}
        />
      )}
    </FormControl>
  );
};

export default withFormValidationState(Checkbox);
