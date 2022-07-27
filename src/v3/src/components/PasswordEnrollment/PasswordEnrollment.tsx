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

import { Box, Button, FormHelperText } from '@mui/material';
import { PasswordInput } from '@okta/odyssey-react-mui';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import { useOnSubmit, useValue } from '../../hooks';
import { useTranslation } from '../../lib/okta-i18n';
import {
  ChangeEvent,
  PasswordEnrollmentElement,
  SubmitEvent,
  UISchemaElementComponent,
} from '../../types';
import InputPassword from '../InputPassword';

const PasswordEnrollment: UISchemaElementComponent<{
  uischema: PasswordEnrollmentElement
}> = ({ uischema }) => {
  const { ctaLabel, input } = uischema.options;

  const { t } = useTranslation();
  const value = useValue(input);
  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
  const onSubmitHandler = useOnSubmit();

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

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (confirmPassword === value) {
      onSubmitHandler({
        includeData: true,
      });
      return;
    }
    setIsTouched(true);
    handleConfirmPasswordValidation(confirmPassword);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsTouched(true);
    setConfirmPassword(e.currentTarget.value);
    handleConfirmPasswordValidation(e.currentTarget.value);
  };

  const handleConfirmPasswordBlur = () => {
    setIsTouched(true);
    handleConfirmPasswordValidation(confirmPassword);
  };

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
        {confirmPasswordError && (
          <FormHelperText error>{confirmPasswordError}</FormHelperText>
        )}
      </Box>
      <Button
        type="submit"
        variant="primary"
        fullWidth
        data-se="#/properties/submit"
        data-type="save"
        onClick={handleSubmit}
      >
        {t(ctaLabel)}
      </Button>
    </Box>
  );
};

export default PasswordEnrollment;
