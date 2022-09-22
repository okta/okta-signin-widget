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
  Autocomplete as MuiAutocomplete,
  AutocompleteRenderInputParams,
  Box,
  FormHelperText,
  InputLabel,
  TextField,
} from '@mui/material';
import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { h } from 'preact';

import { getMessage } from '../../../../v2/ion/i18nTransformer';
import { useAutoFocus, useOnChange, useValue } from '../../hooks';
import {
  FieldElement, UISchemaElementComponent,
} from '../../types';

const Autocomplete: UISchemaElementComponent<{
  uischema: FieldElement
}> = ({ uischema }) => {
  const value = useValue(uischema);
  const onChangeHandler = useOnChange(uischema);
  const { label, focus } = uischema;
  const {
    inputMeta: {
      // @ts-ignore expose type from auth-js
      messages = {},
      name,
      options,
    },
    customOptions,
  } = uischema.options;
  const autocompleteProps = {
    options: (customOptions ?? options)!,
    getOptionLabel: (opt: IdxOption) => opt.label,
    autoHighlight: true,
    autoSelect: true,
    disableClearable: true,
    disablePortal: true,
  };
  const selectedOption = autocompleteProps.options.find((opt) => opt.value === value) || null;
  const error = messages?.value?.[0] && getMessage(messages.value[0]);
  const focusRef = useAutoFocus<HTMLSelectElement>(focus);

  const handleChange = (_: unknown, option: IdxOption | null) => {
    const newValue = option === null ? '' : option.value as string;
    onChangeHandler(newValue);
  };

  return (
    <Box>
      <InputLabel htmlFor={name}>{label}</InputLabel>
      <MuiAutocomplete
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...autocompleteProps}
        id={name}
        value={selectedOption}
        onChange={handleChange}
        fullWidth
        renderInput={
          (params: AutocompleteRenderInputParams) => {
            // InputLabelProps is incompatible with TextField component, need to exclude it
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { InputLabelProps, inputProps, ...rest } = params;
            return (
              <TextField
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
                error={error !== undefined}
                inputProps={{
                  ...inputProps,
                  'aria-describedby': error && `${name}-error`,
                }}
                inputRef={focusRef}
              />
            );
          }
        }
      />
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
    </Box>
  );
};

export default Autocomplete;
