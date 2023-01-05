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
  EyeIcon,
  EyeOffIcon,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  Tooltip,
} from '@okta/odyssey-react-mui';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import {
  useAutoFocus,
  useOnChange,
  useValue,
} from '../../hooks';
import {
  ChangeEvent,
  ClickEvent,
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { buildInputDescribedByValue, getTranslation } from '../../util';
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
  const { translations = [], focus, required } = uischema;
  const {
    attributes,
    inputMeta: { name },
  } = uischema.options;
  const label = getTranslation(translations, 'label');
  const hint = getTranslation(translations, 'hint');
  const explain = getTranslation(translations, 'bottomExplain');
  const focusRef = useAutoFocus<HTMLInputElement>(focus);
  const hasErrors = typeof errors !== 'undefined';
  const hintId = hint && `${name}-hint`;
  const explainId = explain && `${name}-explain`;
  const updatedDescribedByIds = buildInputDescribedByValue(describedByIds, hintId, explainId);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const changedVal = e.currentTarget.value;
    setTouched?.(true);
    onChangeHandler(changedVal);
    onValidateHandler?.(setErrors, changedVal);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (e: ClickEvent) => {
    e.preventDefault();
  };

  return (
    <Box>
      <InputLabel
        htmlFor={name}
        required={required}
      >
        {label}
      </InputLabel>
      {hint && (
        <FormHelperText
          id={hintId}
          className="o-form-explain"
          data-se={hintId}
        >
          {hint}
        </FormHelperText>
      )}
      <InputBase
        id={name}
        name={name}
        error={hasErrors}
        inputRef={focusRef}
        onChange={handleChange}
        type={showPassword ? 'text' : 'password'}
        value={value}
        disabled={loading}
        fullWidth
        inputProps={{
          'data-se': name,
          'aria-describedby': updatedDescribedByIds,
          ...attributes,
        }}
        endAdornment={(
          <InputAdornment position="end">
            <Tooltip title={showPassword ? getTranslation(translations, 'hide') : getTranslation(translations, 'show')}>
              <IconButton
                // TODO: OKTA-558040 request translation keys for aria labels
                aria-label={getTranslation(translations, 'visibilityToggleLabel')}
                aria-pressed={showPassword}
                aria-controls={name}
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                sx={{
                  '&.Mui-focusVisible': {
                    outlineStyle: 'solid',
                    outlineWidth: '1px',
                  },
                }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </IconButton>
            </Tooltip>
          </InputAdornment>
        )}
      />
      {hasErrors && (
        <FieldErrorContainer
          errors={errors}
          fieldName={name}
        />
      )}
      {explain && (
        <FormHelperText
          id={explainId}
          className="o-form-explain"
          data-se={explainId}
        >
          {explain}
        </FormHelperText>
      )}
    </Box>
  );
};

export default withFormValidationState(InputPassword);
