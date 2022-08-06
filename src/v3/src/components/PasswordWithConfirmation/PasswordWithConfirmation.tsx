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

import { getMessage } from '../../../../v2/ion/i18nTransformer';
import { useWidgetContext } from '../../contexts';
import {
  ChangeEvent,
  PasswordWithConfirmationElement,
  UISchemaElementComponent,
} from '../../types';
import InputPassword from '../InputPassword';

const PasswordWithConfirmation: UISchemaElementComponent<{
  uischema: PasswordWithConfirmationElement
}> = ({ uischema }) => {
  const {
    newPasswordElement,
    confirmPasswordElement: {
      label,
      options: {
        inputMeta: {
          name,
          // @ts-ignore expose type from auth-js
          messages = {},
        },
        attributes,
      },
    },
  } = uischema.options;

  const { additionalData, setAdditionalData } = useWidgetContext();
  const confirmPasswordError = messages?.value?.[0] && getMessage(messages.value[0]);

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAdditionalData((data) => ({
      ...data,
      [name]: e.currentTarget.value,
    }));
  };

  return (
    <Box>
      <Box marginBottom={4}>
        <InputPassword uischema={newPasswordElement} />
      </Box>
      <Box>
        <PasswordInput
          label={label}
          name={name}
          value={additionalData[name]}
          id={name}
          error={!!confirmPasswordError}
          onChange={handleConfirmPasswordChange}
          fullWidth
          inputProps={{
            'data-se': name,
            ...attributes,
          }}
        />
        {!!confirmPasswordError && (
        <FormHelperText
          ariaDescribedBy={name}
          data-se={`${name}-error`}
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
