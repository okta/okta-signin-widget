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

import { Box, Button, TextInput } from '@okta/odyssey-react';
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
    setConfirmPassword(e.target.value);
    handleConfirmPasswordValidation(e.target.value);
  };

  const handleConfirmPasswordBlur = () => {
    setIsTouched(true);
    handleConfirmPasswordValidation(confirmPassword);
  };

  return (
    // @ts-ignore OKTA-471233
    <Box>
      {/* @ts-ignore OKTA-471233 */}
      <Box marginBottom="m">
        <InputPassword uischema={input} />
      </Box>
      {/* @ts-ignore OKTA-471233 */}
      <Box marginBottom="m">
        <TextInput
          error={isTouched && confirmPasswordError}
          type="password"
          name="credentials.confirmPassword"
          id="credentials.confirmPassword"
          data-se="credentials.confirmPassword"
          label={t('oie.password.confirmPasswordLabel')}
          value={confirmPassword}
          onBlur={handleConfirmPasswordBlur}
          onChange={handleConfirmPasswordChange}
          autocomplete="new-password"
        />
      </Box>
      {/* TODO: Use MUI password component */}
      <Button
        data-se="#/properties/submit"
        size="m"
        type="submit"
        variant="primary"
        wide
        onClick={handleSubmit}
      >
        {t(ctaLabel)}
      </Button>
    </Box>
  );
};

export default PasswordEnrollment;
