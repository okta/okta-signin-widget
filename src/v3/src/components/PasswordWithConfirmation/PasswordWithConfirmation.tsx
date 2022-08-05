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
import { IdxMessage } from '@okta/okta-auth-js';
import { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';

import { getMessage } from '../../../../v2/ion/i18nTransformer';
import { useWidgetContext } from '../../contexts';
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
  const { newPasswordElement, confirmPasswordElement } = uischema.options;
  const {
    options: {
      inputMeta: {
        name: newPwName,
        // @ts-ignore expose type from auth-js
        messages: newPasswordMessages = {},
      },
    },
  } = newPasswordElement;

  const {
    label: confirmPwLabel,
    options: {
      inputMeta: {
        name: confirmPwName,
        // @ts-ignore expose type from auth-js
        messages = {},
      },
      attributes,
    },
  } = confirmPasswordElement;

  // Updating dataSchema validate fn requires a slight delay, need to wait for completion to show component
  const [isReady, setIsReady] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const { dataSchemaRef } = useWidgetContext();
  const confirmPasswordError = messages?.value?.[0] && getMessage(messages.value[0]);

  // Overrides default validate function for password field
  const validate = useCallback((data: FormBag['data']) => {
    const newPw = data[newPwName];
    const errorMessages: Partial<IdxMessage & { name?: string }>[] = [];
    if (!newPw) {
      errorMessages.push({ name: newPwName, i18n: { key: 'model.validation.field.blank' } });
    }

    if (!confirmPassword) {
      errorMessages.push({ name: confirmPwName, i18n: { key: 'model.validation.field.blank' } });
    } else if (confirmPassword !== newPw) {
      errorMessages.push({ name: confirmPwName, i18n: { key: 'password.error.match' } });
    }

    return errorMessages.length ? errorMessages : undefined;
  }, [confirmPassword, newPwName, confirmPwName]);

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.currentTarget.value);
  };

  useEffect(() => {
    setIsReady(false);
    // update validate function to prevent submission w/o confirm pw data
    // when server messages are set, we must reset the validate function
    (dataSchemaRef.current![newPwName] as DataSchema).validate = validate;
    setIsReady(true);
  }, [validate, newPwName, dataSchemaRef, confirmPasswordError, newPasswordMessages]);

  return isReady ? (
    <Box>
      <Box marginBottom={4}>
        <InputPassword uischema={newPasswordElement} />
      </Box>
      <Box>
        <PasswordInput
          label={confirmPwLabel}
          name={confirmPwName}
          value={confirmPassword}
          id={confirmPwName}
          error={!!confirmPasswordError}
          onChange={handleConfirmPasswordChange}
          fullWidth
          inputProps={{
            'data-se': confirmPwName,
            ...attributes,
          }}
        />
        {!!confirmPasswordError && (
        <FormHelperText
          ariaDescribedBy={confirmPwName}
          data-se={`${confirmPwName}-error`}
          error
        >
          {confirmPasswordError}
        </FormHelperText>
        )}
      </Box>
    </Box>
  ) : null;
};

export default PasswordWithConfirmation;
