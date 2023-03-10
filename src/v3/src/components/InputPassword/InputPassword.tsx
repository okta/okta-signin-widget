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
  useHtmlContentParser,
  useValue,
} from '../../hooks';
import {
  ChangeEvent,
  ClickEvent,
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { getTranslation } from '../../util';
import FieldLevelMessageContainer from '../FieldLevelMessageContainer';
import { withFormValidationState } from '../hocs';

const InputPassword: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  uischema,
  errors,
  handleChange,
  handleBlur,
  describedByIds,
}) => {
  const value = useValue(uischema);
  const { loading } = useWidgetContext();
  const { translations = [], focus, required } = uischema;
  const {
    attributes,
    inputMeta: { name },
  } = uischema.options;
  const label = getTranslation(translations, 'label');
  const hint = getTranslation(translations, 'hint');
  const explain = getTranslation(translations, 'bottomExplain');
  const showVisibilityToggleLabel = getTranslation(translations, 'showToggleLabel');
  const hideVisibilityToggleLabel = getTranslation(translations, 'hideToggleLabel');
  const focusRef = useAutoFocus<HTMLInputElement>(focus);
  const parsedExplainContent = useHtmlContentParser(explain);
  const hasErrors = typeof errors !== 'undefined';
  // TODO: OKTA-569647 - refactor logic
  const hintId = hint && `${name}-hint`;
  const explainId = explain && `${name}-explain`;
  const ariaDescribedByIds = [describedByIds, hintId, explainId].filter(Boolean).join(' ')
    || undefined;
  const [showPassword, setShowPassword] = useState<boolean>(false);

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
          // TODO: OKTA-577905 - Temporary fix until we can upgrade to the latest version of Odyssey
          sx={{ textAlign: 'start' }}
        >
          {hint}
        </FormHelperText>
      )}
      <InputBase
        id={name}
        name={name}
        error={hasErrors}
        inputRef={focusRef}
        onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          handleChange?.(e.currentTarget.value);
        }}
        onBlur={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          handleBlur?.(e?.currentTarget?.value);
        }}
        type={showPassword ? 'text' : 'password'}
        value={value}
        disabled={loading}
        fullWidth
        inputProps={{
          'data-se': name,
          'aria-describedby': ariaDescribedByIds,
          ...attributes,
        }}
        endAdornment={(
          <InputAdornment position="end">
            <Tooltip title={showPassword ? getTranslation(translations, 'hide') : getTranslation(translations, 'show')}>
              <IconButton
                aria-label={showPassword ? hideVisibilityToggleLabel : showVisibilityToggleLabel}
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
        <FieldLevelMessageContainer
          messages={errors}
          fieldName={name}
        />
      )}
      {explain && (
        <FormHelperText
          id={explainId}
          className="o-form-explain"
          data-se={explainId}
          // TODO: OKTA-577905 - Temporary fix until we can upgrade to the latest version of Odyssey
          sx={{ textAlign: 'start' }}
        >
          {parsedExplainContent}
        </FormHelperText>
      )}
    </Box>
  );
};

export default withFormValidationState(InputPassword);
