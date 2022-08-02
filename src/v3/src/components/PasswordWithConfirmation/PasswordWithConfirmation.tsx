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
import { useOnChange, useValue } from '../../hooks';
import {
  ChangeEvent,
  FormBag,
  PasswordWithConfirmationElement,
  UISchemaElementComponent,
} from '../../types';
import { getLabelName } from '../helpers';

enum PasswordType {
  NEW,
  CONFIRM,
}

const PasswordWithConfirmation: UISchemaElementComponent<{
  uischema: PasswordWithConfirmationElement
}> = ({ uischema }) => {
  const { input } = uischema.options;
  const {
    name: newPwName,
    label: newPwLabel,
    options: {
      inputMeta: {
        // @ts-ignore expose type from auth-js
        messages = {},
      },
      attributes,
    },
  } = input;

  const { dataSchemaRef } = useWidgetContext();
  const value = useValue(input);
  const onChangeHandler = useOnChange(input);
  // Must use this flag to determine which field contains error
  const [hasNewPwError, setHasNewPwError] = useState<boolean>(false);
  const [isNewPwTouched, setIsNewPwTouched] = useState<boolean>(false);
  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const newPasswordError = hasNewPwError && messages?.value?.[0]
    && getMessage(messages.value[0]);
  const confirmPasswordError = !hasNewPwError
    ? (messages?.value?.[0] && getMessage(messages.value[0]))
    : (messages?.value?.[1] && getMessage(messages.value[1]));

  // Overrides default validate function for password field
  const validate = useCallback((data: FormBag['data']) => {
    const newPw = data[input.name];
    const errorMessages: Partial<IdxMessage>[] = [];
    if (!newPw) {
      setIsNewPwTouched(false);
      setHasNewPwError(true);
      errorMessages.push({ i18n: { key: 'model.validation.field.blank' } });
    } else {
      setHasNewPwError(false);
    }

    if (!confirmPassword) {
      setIsTouched(false);
      errorMessages.push({ i18n: { key: 'model.validation.field.blank' } });
    } else if (confirmPassword !== newPw) {
      setIsTouched(false);
      errorMessages.push({ i18n: { key: 'password.error.match' } });
    }

    return errorMessages.length ? errorMessages : undefined;
  }, [confirmPassword, input.name, setHasNewPwError, setIsTouched, setIsNewPwTouched]);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>, type: PasswordType) => {
    if (type === PasswordType.NEW) {
      setIsNewPwTouched(true);
      onChangeHandler(e.currentTarget.value);
    } else {
      setIsTouched(true);
      setConfirmPassword(e.currentTarget.value);
    }
  };

  const handlePasswordBlur = (type: PasswordType) => {
    if (type === PasswordType.NEW) {
      setIsNewPwTouched(true);
    } else {
      setIsTouched(true);
    }
  };

  useEffect(() => {
    // update validate function to prevent submission w/o confirm pw data
    // when server messages are set, we must reset the validate function
    dataSchemaRef.current![input.name].validate = validate;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validate, newPasswordError, confirmPasswordError, input.name]);

  return (
    <Box>
      <Box marginBottom={4}>
        <PasswordInput
          label={getLabelName(newPwLabel!)}
          value={value}
          name={newPwName}
          id={newPwName}
          error={!isNewPwTouched && !!newPasswordError}
          onBlur={() => handlePasswordBlur(PasswordType.NEW)}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handlePasswordChange(e, PasswordType.NEW)}
          fullWidth
          inputProps={{
            'data-se': newPwName,
            ...attributes,
          }}
        />
        {(!isNewPwTouched && !!newPasswordError) && (
          <FormHelperText
            data-se={`${newPwName}-error`}
            error
          >
            {newPasswordError}
          </FormHelperText>
        )}
      </Box>
      <Box marginBottom={4}>
        <PasswordInput
          label={uischema.label}
          value={confirmPassword}
          id="credentials.confirmPassword"
          error={!!(!isTouched && confirmPasswordError)}
          onBlur={() => handlePasswordBlur(PasswordType.CONFIRM)}
          onChange={
            (e: ChangeEvent<HTMLInputElement>) => handlePasswordChange(e, PasswordType.CONFIRM)
          }
          fullWidth
          inputProps={{
            'data-se': 'credentials.confirmPassword',
            autocomplete: 'new-password',
          }}
        />
        {!!(!isTouched && !!confirmPasswordError) && (
          <FormHelperText
            ariaDescribedBy="credentials.confirmPassword"
            data-se="credentials.confirmPassword-error"
            error
          >
            {confirmPasswordError}
          </FormHelperText>
        )}
      </Box>
    </Box>
  );
};

export default PasswordWithConfirmation;
