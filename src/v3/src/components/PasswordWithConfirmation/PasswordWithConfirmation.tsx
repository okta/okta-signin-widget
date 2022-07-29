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
import { useCallback, useEffect, useState } from 'preact/hooks';

import { getMessage } from '../../../../v2/ion/i18nTransformer';
import { useWidgetContext } from '../../contexts';
import { useValue } from '../../hooks';
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
  const { input, fieldRequiredErrorMessage, passwordMatchErrorMessage } = uischema.options;
  const {
    inputMeta: {
      // @ts-ignore expose type from auth-js
      messages: newPasswordMessages = {},
    },
  } = input.options;
  const error = newPasswordMessages?.value?.[0] && getMessage(newPasswordMessages.value[0]);

  console.log('aaaa', error);

  

  const value = useValue(input);
  // const [isTouched, setIsTouched] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
  const { dataSchemaRef } = useWidgetContext();

  const validate = useCallback((data: FormBag['data']) => {
    const password = data[input.name];

    console.log('validate', password, confirmPassword);
    
    if (confirmPassword === password) {
      return undefined;
    }

    return {
      i18n: {
        key: 'password.error.match',
      }
    }
  }, [confirmPassword]);

  useEffect(() => {
    dataSchemaRef.current![input.name].validate = validate;
  }, [validate]);

  // const handleConfirmPasswordValidation = (password: string | undefined): void => {
  //   if (!password) {
  //     setConfirmPasswordError(fieldRequiredErrorMessage);
  //     return;
  //   }

  //   if (value !== password) {
  //     setConfirmPasswordError(passwordMatchErrorMessage);
  //     return;
  //   }

  //   setConfirmPasswordError(undefined);
  // };

  // const updateDataSchemaValidation = (confirmPw?: string): void => {
  //   dataSchemaRef.current![input.name] = {
  //     validate: (data: FormBag['data']) => {
  //       const newPw = data[input.name];
  //       const comparisonPw = (confirmPw ?? confirmPassword);
  //       if (!newPw) {
  //         setIsTouched(true);
  //         return { i18n: { key: 'model.validation.field.blank' } };
  //       }

  //       if (comparisonPw !== newPw) {
  //         setIsTouched(true);
  //         // Do not display error on new password field when confirm is missing
  //         // but do not allow submission
  //         return { i18n: { key: '' } };
  //       }

  //       return undefined;
  //     },
  //   } as DataSchema;
  // };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    // setIsTouched(true);
    setConfirmPassword(e.currentTarget.value);
    // updateDataSchemaValidation(e.currentTarget.value);
    // handleConfirmPasswordValidation(e.currentTarget.value);
  };

  // const handleConfirmPasswordBlur = () => {
  //   setIsTouched(true);
  //   updateDataSchemaValidation();
  //   handleConfirmPasswordValidation(confirmPassword);
  // };

  // useEffect(() => {
  //   // on load, update validate function to prevent submission w/o confirm pw data
  //   updateDataSchemaValidation();
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [newPasswordError]);

  return (
    <Box>
      <Box marginBottom={4}>
        <InputPassword uischema={input} noError />
      </Box>
      <Box marginBottom={4}>
        <PasswordInput
          label={uischema.label}
          value={confirmPassword}
          name="credentials.confirmPassword"
          id="credentials.confirmPassword"
          error={!!(confirmPasswordError)}
          helperText={confirmPasswordError}
          // onBlur={handleConfirmPasswordBlur}
          onChange={handleConfirmPasswordChange}
          fullWidth
          inputProps={{
            'data-se': 'credentials.confirmPassword',
            autocomplete: 'new-password',
          }}
        />
        {!!(error) && (
          <FormHelperText error>{error}</FormHelperText>
        )}
      </Box>
    </Box>
  );
};

export default PasswordWithConfirmation;
