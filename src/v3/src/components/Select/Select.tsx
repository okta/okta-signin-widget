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

import { SelectChangeEvent } from '@mui/material';
import {
  Box, FormControl, InputLabel, Select as MuiSelect, Typography,
} from '@okta/odyssey-react-mui';
import { IdxOption } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';
import { h } from 'preact';

import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useValue } from '../../hooks';
import {
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { getTranslation } from '../../util';
import FieldLevelMessageContainer from '../FieldLevelMessageContainer';
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
  const { focus, translations = [], showAsterisk } = uischema;
  const label = getTranslation(translations, 'label');
  const emptyOptionLabel = getTranslation(translations, 'empty-option-label');
  const optionalLabel = getTranslation(translations, 'optionalLabel');

  const {
    attributes,
    inputMeta: {
      name,
      options,
      required,
    },
    customOptions,
  } = uischema.options;
  const focusRef = useAutoFocus<HTMLSelectElement>(focus);
  const hasErrors = typeof errors !== 'undefined';

  const getOptions = (): IdxOption[] | undefined => {
    if (Array.isArray(customOptions) || Array.isArray(options)) {
      return customOptions ?? options;
    }

    if (typeof options === 'object') {
      return Object.entries(options)
        .filter(([key, val]) => key !== '' && val !== '')
        .map(([key, val]) => ({ label: val, value: key } as IdxOption));
    }
    return undefined;
  };

  return (
    <FormControl
      disabled={loading}
      error={hasErrors}
    >
      <InputLabel
        htmlFor={name}
        // To prevent asterisk from shifting far right
        sx={{ justifyContent: showAsterisk ? 'flex-start' : undefined }}
      >
        {label}
        {showAsterisk && (
          <Box
            component="span"
            className="no-translate"
            aria-hidden
          >
            {' *'}
          </Box>
        )}
        {required === false && (
          <Typography variant="subtitle1">{optionalLabel}</Typography>
        )}
      </InputLabel>
      <MuiSelect
        native
        variant="standard"
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
              {emptyOptionLabel}
            </option>,
          ].concat(
            getOptions()?.map((option: IdxOption) => (
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
        <FieldLevelMessageContainer
          messages={errors}
          fieldName={name}
        />
      )}
    </FormControl>
  );
};

export default withFormValidationState(Select);
