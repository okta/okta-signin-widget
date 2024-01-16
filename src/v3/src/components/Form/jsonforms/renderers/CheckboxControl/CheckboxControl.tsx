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
  Checkbox as CheckboxMui,
  FormControl,
  FormControlLabel,
  FormHelperText,
} from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';

import { useWidgetContext } from '../../../../../contexts';
import { useAutoFocus } from '../../../../../hooks';
import { ControlProps } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';

const CheckboxControl: FunctionComponent<ControlProps> = ({
  data,
  handleChange,
  path,
  config,
  schema,
  uischema,
}) => {
  const { loading } = useWidgetContext();

  const {
    // showAsterisk,
    options: {
      /** Unused props */
      focus,
      noTranslate,
      mutable,
      /** END */
      label,
      value,
    } = {},
  } = uischema;
  const isReadOnly = mutable === false;
  // const labelInfo = getTranslationInfo(translations, 'label');
  // const descriptionInfo = getTranslationInfo(translations, 'description');
  const focusRef = useAutoFocus<HTMLInputElement>(focus);

  return (
    <Box marginBottom={4}>
      <FormControl
        component="fieldset"
        className={noTranslate ? 'no-translate' : undefined}
      >
        <FormControlLabel
          sx={{ alignItems: 'flex-start', gap: 0 }}
          control={(
            <CheckboxMui
              size="medium"
              checked={!!data}
              id={path}
              name={path}
              inputRef={focusRef}
              // handleChange={handleChange}
              onChange={(_ev, isChecked) => handleChange(path, isChecked)}
              disabled={loading || isReadOnly}
              inputProps={{
                'data-se': path,
                'data-se-for-name': path,
              }}
              sx={(theme) => ({
                marginInlineEnd: theme.spacing(2),
              })}
            />
          )}
          label={label.content.text}
        />
      </FormControl>
    </Box>
  );
};

const WrappedCheckboxControl = withJsonFormsControlProps(CheckboxControl);
export default WrappedCheckboxControl;
