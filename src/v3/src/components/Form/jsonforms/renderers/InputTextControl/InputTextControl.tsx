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

import { ControlProps } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box } from '@mui/material';
import {
  TextField,
  useOdysseyDesignTokens,
} from '@okta/odyssey-react-mui';
import { merge } from 'lodash';
import { FunctionComponent, h } from 'preact';
import { useState } from 'preact/hooks';
import { ChangeEvent } from 'src/types';

import { useWidgetContext } from '../../../../../contexts';
import { useAutoFocus, useDebouncedChange } from '../../../../../hooks';
import { eventToValue } from '../../../../../util';

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
  const tokens = useOdysseyDesignTokens();
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const { loading, formErrors } = useWidgetContext();
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

  return (
    <Box sx={{marginBlockEnd: tokens.Spacing3}}>
      <TextField
        // autoCompleteType={autocomplete}
        errorMessage={errors}
        // errorMessageList={errorMessageList}
        // hint={hint ?? parsedExplainContent as string}
        id={path}
        inputRef={focusRef}
        // inputMode={inputmode}
        isDisabled={loading}
        isFullWidth
        // isOptional={required === false}
        name={path}
        label={label}
        onChange={onChange}
        onBlur={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          e?.preventDefault();
          setTouched(true);
        }}
        testId={path}
        type="text"
        value={inputText}
      />
    </Box>
  );
};

const WrappedInputText = withJsonFormsControlProps(InputText);
export default WrappedInputText;
