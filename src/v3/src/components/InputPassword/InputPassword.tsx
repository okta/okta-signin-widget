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

import { Box } from '@mui/material';
import { PasswordInput } from '@okta/odyssey-react-mui';
import { h } from 'preact';

import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useOnChange, useValue } from '../../hooks';
import {
  ChangeEvent,
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { getTranslation } from '../../util';
import FieldErrorContainer from '../FieldErrorContainer';
import { withFormValidationState } from '../hocs';

const InputPassword: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
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
  const label = getTranslation(uischema.translations!);
  const { translations = [], focus, required } = uischema;
  const {
    attributes,
    inputMeta: { name },
  } = uischema.options;
  const focusRef = useAutoFocus<HTMLInputElement>(focus);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const changedVal = e.currentTarget.value;
    setTouched?.(true);
    onChangeHandler(changedVal);
    onValidateHandler?.(setErrors, changedVal);
  };

  return (
    <Box>
      <PasswordInput
        label={label + (required ? ' *' : '')}
        tooltipLabel={
          (isHidden: boolean) => (isHidden ? getTranslation(translations, 'show') : getTranslation(translations, 'hide'))
        }
        value={value}
        name={name}
        id={name}
        error={errors !== undefined}
        onChange={handleChange}
        disabled={loading}
        fullWidth
        inputProps={{
          'data-se': name,
          'aria-describedby': describedByIds,
          ...attributes,
        }}
        ref={focusRef}
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

export default withFormValidationState(InputPassword);
