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
import { Checkbox as OdyCheckbox, CheckboxGroup, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';

import { useWidgetContext } from '../../../../../contexts';
import { useAutoFocus } from '../../../../../hooks';
import { ChangeEvent } from '../../../../../types';

const CheckboxControl: FunctionComponent<ControlProps> = ({
  data,
  handleChange,
  path,
  config,
  schema,
  uischema,
}) => {
  const { loading } = useWidgetContext();
  const tokens = useOdysseyDesignTokens();

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
    <Box sx={{marginBlockEnd: tokens.Spacing3}}>
      <CheckboxGroup
        // errorMessage={errorMessage}
        // errorMessageList={errorMessageList}
        label=""
      >
        <OdyCheckbox
          // hint={description}
          id={`${path}-checkbox`}
          inputRef={focusRef}
          isChecked={value === true}
          isDisabled={loading || isReadOnly}
          label={label}
          name={path}
          // onBlur={(e: ChangeEvent<HTMLInputElement>) => {
          //   handleBlur?.(e?.currentTarget?.checked);
          // }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleChange(path, e.currentTarget.checked)
          }}
          testId={path}
        />
      </CheckboxGroup>
    </Box>
  );
};

const WrappedCheckboxControl = withJsonFormsControlProps(CheckboxControl);
export default WrappedCheckboxControl;
