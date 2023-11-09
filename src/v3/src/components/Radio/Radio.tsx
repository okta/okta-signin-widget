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
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio as RadioMui,
  RadioGroup,
  Typography,
} from '@okta/odyssey-react-mui-legacy';
import { IdxOption } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';
import { h } from 'preact';

import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useValue } from '../../hooks';
import {
  ChangeEvent,
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { getTranslation } from '../../util';
import FieldLevelMessageContainer from '../FieldLevelMessageContainer';
import { withFormValidationState } from '../hocs';

const Radio: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  uischema,
  errors,
  handleChange,
  handleBlur,
  describedByIds,
}) => {
  const value = useValue(uischema);
  const { loading } = useWidgetContext();
  const {
    translations = [],
    options: {
      inputMeta: {
        name,
        options,
        required,
      },
      customOptions,
    },
    focus,
    showAsterisk,
  } = uischema;
  const label = getTranslation(translations, 'label');
  const labelId = `${name}-label`;
  const optionalLabel = getTranslation(translations, 'optionalLabel');
  const focusRef = useAutoFocus<HTMLInputElement>(focus);
  const hasErrors = typeof errors !== 'undefined';

  return (
    <FormControl
      component="fieldset"
      error={hasErrors}
    >
      {label && (
        <FormLabel
          id={labelId}
          // To prevent asterisk from shifting far right
          sx={{ display: 'flex', justifyContent: showAsterisk ? 'flex-start' : 'space-between' }}
        >
          {label}
          {showAsterisk && (
            <Box
              component="span"
              sx={(theme) => ({
                marginInlineStart: theme.spacing(1),
                marginInlineEnd: theme.spacing(1),
              })}
              className="no-translate"
              aria-hidden
            >
              *
            </Box>
          )}
          {required === false && (
            <Typography
              variant="subtitle1"
              sx={{ whiteSpace: 'nowrap' }}
            >
              {optionalLabel}
            </Typography>
          )}
        </FormLabel>
      )}
      <RadioGroup
        name={name}
        id={name}
        data-se={name}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(label && { 'aria-labelledby': labelId })}
        aria-describedby={describedByIds}
        value={value as string ?? ''}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          handleChange?.(e.currentTarget.value);
        }}
      >
        {
          (customOptions ?? options)?.map((item: IdxOption, index: number) => (
            <FormControlLabel
              control={(
                <RadioMui
                  sx={(theme) => ({
                    marginInlineEnd: theme.spacing(2),
                  })}
                />
              )}
              key={item.value}
              value={item.value}
              label={item.label}
              disabled={loading}
              onBlur={(e: ChangeEvent<HTMLInputElement>) => {
                handleBlur?.(e?.currentTarget?.value);
              }}
              sx={{
                gap: 0,
              }}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...(index === 0 && { inputRef: focusRef })}
            />
          ))
        }
      </RadioGroup>
      {hasErrors && (
        <FieldLevelMessageContainer
          messages={errors}
          fieldName={name}
        />
      )}
    </FormControl>
  );
};

const WrappedRadio = withFormValidationState(Radio);
export default WrappedRadio;
