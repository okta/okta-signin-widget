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

import { Box, FormHelperText } from '@mui/material';
import { PasswordInput } from '@okta/odyssey-react-mui';
import { h } from 'preact';

import { useAutoFocus, useOnChange, useValue } from '../../hooks';
import {
  ChangeEvent,
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { getTranslation } from '../../util';
import { withFormValidationState } from '../hocs';

const InputPassword: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  uischema,
  setTouched,
  error,
  setError,
  onValidateHandler,
}) => {
  const value = useValue(uischema);
  const onChangeHandler = useOnChange(uischema);
  const label = getTranslation(uischema.translations!);
  const { translations = [], focus } = uischema;
  const {
    attributes,
    inputMeta: { name },
  } = uischema.options;
  const focusRef = useAutoFocus<HTMLInputElement>(focus);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const changedVal = e.currentTarget.value;
    setTouched?.(true);
    onChangeHandler(changedVal);
    onValidateHandler?.(setError, changedVal);
  };

  return (
    <Box>
      <PasswordInput
        label={label}
        tooltipLabel={
          (isHidden: boolean) => (isHidden ? getTranslation(translations, 'show') : getTranslation(translations, 'hide'))
        }
        value={value}
        name={name}
        id={name}
        error={error !== undefined}
        onBlur={() => {
          setTouched?.(true);
          onValidateHandler?.(setError);
        }}
        onChange={handleChange}
        fullWidth
        inputProps={{
          'data-se': name,
          ...attributes,
        }}
        ref={focusRef}
      />
      {error && (
        <FormHelperText
          data-se={`${name}-error`}
          error
        >
          {error}
        </FormHelperText>
      )}
    </Box>

  );
};

export default withFormValidationState(InputPassword);
