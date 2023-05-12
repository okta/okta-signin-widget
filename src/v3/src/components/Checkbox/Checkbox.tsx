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
} from '@okta/odyssey-react-mui';
import { Fragment, h } from 'preact';

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

const Checkbox: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  uischema,
  errors,
  handleChange,
  handleBlur,
  describedByIds,
}) => {
  const value = useValue(uischema);
  const { loading } = useWidgetContext();

  const {
    options: { inputMeta: { name } }, focus, translations = [], showAsterisk,
  } = uischema;
  const label = getTranslation(translations, 'label');
  const focusRef = useAutoFocus<HTMLInputElement>(focus);
  const hasErrors = typeof errors !== 'undefined';

  return (
    <FormControl
      component="fieldset"
      error={hasErrors}
      aria-describedby={describedByIds}
    >
      <FormControlLabel
        control={(
          <CheckboxMui
            size="medium"
            checked={value === true}
            id={name}
            name={name}
            inputRef={focusRef}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleChange?.(e.currentTarget.checked);
            }}
            onBlur={(e: ChangeEvent<HTMLInputElement>) => {
              handleBlur?.(e?.currentTarget?.checked);
            }}
            disabled={loading}
            inputProps={{
              'data-se': name,
              'data-se-for-name': name,
            }}
          />
        )}
        label={(
          <Fragment>
            {label}
            {showAsterisk && (
              <Box
                component="span"
                sx={(theme) => ({ marginInlineStart: theme.spacing(1), marginInlineEnd: theme.spacing(1) })}
                className="no-translate"
                aria-hidden
              >
                *
              </Box>
            )}
          </Fragment>
        )}
      />
      {hasErrors && (
        <FieldLevelMessageContainer
          messages={errors}
          fieldName={name}
        />
      )}
    </FormControl>
  );
};

export default withFormValidationState(Checkbox);
