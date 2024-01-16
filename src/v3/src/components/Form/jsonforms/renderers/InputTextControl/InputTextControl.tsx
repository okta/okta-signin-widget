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
  CellProps,
  ControlElement,
  ControlProps,
  JsonSchema7,
  Layout,
  UISchemaElement,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  Box,
  FormHelperText,
  InputBase,
  InputLabel,
} from '@okta/odyssey-react-mui';
import { merge } from 'lodash';
import { FunctionComponent, h } from 'preact';

import { useWidgetContext } from '../../../../../contexts';
import { useAutoFocus, useDebouncedChange } from '../../../../../hooks';
import { eventToValue } from '../../../../../util';
import { ChangeEvent } from 'src/types';
import { useState } from 'preact/hooks';

const InputText: FunctionComponent<ControlProps> = ({
  data,
  handleChange,
  path,
  label,
  config,
  schema,
  errors,
  uischema,
}) => {
  console.log('INPUT TEXT control errors:', errors);
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  console.log('InputTextControl appliedUiSchemaOptions:', appliedUiSchemaOptions);
  const { loading, formErrors, } = useWidgetContext();
  console.log('FORM ERRORS FROM INPUT TEXT control:', formErrors);
  const focusRef = useAutoFocus<HTMLInputElement>(appliedUiSchemaOptions.focus);
  const [touched, setTouched] = useState<boolean>(false);
  const hasErrors = touched && typeof errors !== 'undefined' && !!errors;
  const [inputText, onChange] = useDebouncedChange(
    handleChange,
    '',
    data,
    path,
    eventToValue,
  );
  console.log('Inside InputTextControl, label:', label);

  return (
    <Box marginBottom={4}>
      <InputLabel htmlFor={path}>
        {label}
      </InputLabel>
      <InputBase
        value={inputText}
        type="text"
        id={path}
        name={path}
        error={hasErrors}
        onChange={onChange}
        onBlur={(e: ChangeEvent<HTMLInputElement>) => {
          e.preventDefault();
          setTouched(true);
        }}
        disabled={loading}
        fullWidth
        inputProps={{
          'data-se': path,
          // 'aria-describedby': ariaDescribedByIds,
          // ...attributes,
        }}
        inputRef={focusRef}
        // dir={dir}
      />
      {hasErrors && (
        <FormHelperText
          id={`${path}-error`}
          role="alert"
          data-se={`${path}-error`}
          error
          // TODO: OKTA-577905 - Temporary fix until we can upgrade to the latest version of Odyssey
          sx={{ textAlign: 'start' }}
        >
          {errors}
        </FormHelperText>
      )}
    </Box>
  );
};

const WrappedInputText = withJsonFormsControlProps(InputText);
export default WrappedInputText;
