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
import { useEffect, useState } from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import { useValue } from '../../hooks';
import { useTranslation } from '../../lib/okta-i18n';
import {
  ChangeEvent,
  DataSchema,
  FormBag,
  PasswordWithConfirmationElement,
  UISchemaElementComponent,
} from '../../types';
import InputPassword from '../InputPassword';

const PasswordWithConfirmation: UISchemaElementComponent<{
  uischema: PasswordWithConfirmationElement
}> = ({ uischema }) => {
  const { t } = useTranslation();
  const { input } = uischema.options;
  const {
    inputMeta: {
      // @ts-ignore expose type from auth-js
      messages: newPasswordMessages = {},
    },
  } = input.options;
  const newPasswordError = t((newPasswordMessages.value || [])[0]?.i18n.key);

  const value = useValue(input);
  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>(
    t('model.validation.field.blank')
  );
  const { dataSchemaRef } = useWidgetContext();

  const handleConfirmPasswordValidation = (password: string | undefined): void => {
    if (!password) {
      setConfirmPasswordError(t('model.validation.field.blank'));
      return;
    }

    if (value !== password) {
      setConfirmPasswordError(t('password.error.match'));
      return;
    }

    setConfirmPasswordError(undefined);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsTouched(true);
    setConfirmPassword(e.currentTarget.value);
    updateDataSchemaValidation(e.currentTarget.value);
    handleConfirmPasswordValidation(e.currentTarget.value);
  };

  const handleConfirmPasswordBlur = () => {
    setIsTouched(true);
    updateDataSchemaValidation();
    handleConfirmPasswordValidation(confirmPassword);
  };

  const updateDataSchemaValidation = (confirmPw?: string): void => {
    dataSchemaRef.current![input.name] = {
      validate: (data: FormBag['data']) => {
        const newPw = data[input.name];
        if (!newPw) {
          return { i18n: { key: t('model.validation.field.blank') } };
        }
        const comparisonPw = (confirmPw ?? confirmPassword);

        if (comparisonPw !== newPw) {
          setIsTouched(true);
          // Do not display error on new password field when confirm is missing
          // but do not allow submission
          return { i18n: { key: '' } };
        }

        return undefined;
      }
    } as DataSchema
  };

  useEffect(() => {
    // on load, update validate function to prevent submission w/o confirm pw data
    updateDataSchemaValidation();
  }, [newPasswordError]);

  return (
    <Box>
      <Box marginBottom={4}>
        <InputPassword uischema={input} />
      </Box>
      <Box marginBottom={4}>
        <PasswordInput
          label={t('oie.password.confirmPasswordLabel')}
          value={confirmPassword}
          name="credentials.confirmPassword"
          id="credentials.confirmPassword"
          error={!!(isTouched && confirmPasswordError)}
          helperText={confirmPasswordError}
          onBlur={handleConfirmPasswordBlur}
          onChange={handleConfirmPasswordChange}
          fullWidth
          inputProps={{
            'data-se': 'credentials.confirmPassword',
            autocomplete: 'new-password',
          }}
        />
        {!!(isTouched && !!confirmPasswordError) && (
          <FormHelperText error>{confirmPasswordError}</FormHelperText>
        )}
      </Box>
    </Box>
  );
};

export default PasswordWithConfirmation;
