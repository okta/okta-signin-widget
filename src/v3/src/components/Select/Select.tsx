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
  Select as MuiSelect,
  SelectChangeEvent,
} from '@mui/material';
import { FormControl, InputLabel } from '@okta/odyssey-react-mui';
import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { h } from 'preact';

import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useValue } from '../../hooks';
import {
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { getTranslation } from '../../util';
import FieldErrorContainer from '../FieldErrorContainer';
import { withFormValidationState } from '../hocs';

const Select: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  uischema,
  errors,
  handleChange,
  handleBlur,
  describedByIds,
}) => {
  const value = useValue(uischema);
  const { loading } = useWidgetContext();
  const { focus, required, translations = [] } = uischema;
  const label = getTranslation(translations, 'label');
  const {
    attributes,
    inputMeta: {
      name,
      options,
    },
    customOptions,
  } = uischema.options;
  const focusRef = useAutoFocus<HTMLSelectElement>(focus);
  const hasErrors = typeof errors !== 'undefined';

  return (
    <FormControl
      disabled={loading}
      error={hasErrors}
      required={required}
    >
      <InputLabel htmlFor={name}>{label}</InputLabel>
      <MuiSelect
        native
        onChange={(e: SelectChangeEvent<string>) => {
          const selectTarget = (
            e?.target as SelectChangeEvent['target'] & { value: string; name: string; }
          );
          handleChange?.(selectTarget.value);
        }}
        onBlur={(e: SelectChangeEvent<string>) => {
          const selectTarget = (
            e?.target as SelectChangeEvent['target'] & { value: string; name: string; }
          );
          handleBlur?.(selectTarget.value);
        }}
        inputRef={focusRef}
        value={value as string}
        inputProps={{
          'data-se': name,
          'aria-describedby': describedByIds,
          name,
          id: name,
          ...attributes,
        }}
      >
        {
          [
            <option
              value=""
              key="empty"
            >
              {/* TODO: OKTA-518793 - need translation key for this string */}
              Select an Option
            </option>,
          ].concat(
            (customOptions ?? options)?.map((option: IdxOption) => (
              <option
                key={option.value}
                value={option.value as string}
              >
                {option.label}
              </option>
            )) || [],
          )
        }
      </MuiSelect>
      {hasErrors && (
        <FieldErrorContainer
          errors={errors}
          fieldName={name}
        />
      )}
    </FormControl>
  );
};

export default withFormValidationState(Select);
