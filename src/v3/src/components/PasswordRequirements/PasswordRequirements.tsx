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

import { Box } from '@mui/material';
import {
  List, Text,
} from '@okta/odyssey-react';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import { h } from 'preact';
import {
  useCallback,
  useEffect,
  useState,
} from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import {
  PasswordRequirementsElement,
  PasswordRequirementStatus,
  PasswordValidation,
  UISchemaElementComponent,
} from '../../types';
import { validatePassword } from '../../util';
import PasswordRequirementItem from './PasswordRequirementItem';

const PasswordRequirements: UISchemaElementComponent<{
  uischema: PasswordRequirementsElement
}> = ({ uischema }) => {
  const { data } = useWidgetContext();
  const {
    fieldKey,
    header,
    id,
    requirements,
    settings,
    userInfo,
    validationDelayMs,
  } = uischema.options as PasswordRequirementsElement['options'];
  const password = get(data, fieldKey);

  const [passwordValidations, setPasswordValidations] = useState<PasswordValidation>({});

  const getPasswordStatus = (
    ruleKey: string,
    passwordValidation: PasswordValidation,
  ): PasswordRequirementStatus | undefined => {
    if (!passwordValidation) {
      return undefined;
    }

    const ruleValue = passwordValidation[ruleKey];
    if (ruleValue) {
      return 'complete';
    }
    if (ruleValue === false) {
      return 'incomplete';
    }
    return 'info';
  };

  const onValidatePassword = (pw: string): void => {
    if (!settings) {
      setPasswordValidations({});
      return;
    }

    const validations = validatePassword(pw, userInfo, settings);
    if (!Object.keys(validations).length) {
      setPasswordValidations({});
      return;
    }
    setPasswordValidations(validations);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const passwordValidationHandler = useCallback(
    debounce(onValidatePassword, validationDelayMs), [validationDelayMs],
  );

  useEffect(() => {
    passwordValidationHandler((password ?? '') as string);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  return requirements?.length > 0 ? (
    <Box data-se="password-authenticator--rules">
      <Box marginBottom={2}>
        <Text as="span">{header}</Text>
      </Box>
      <List
        id={id}
        listType="unordered"
        unstyled
      >
        {requirements.map(({ ruleKey, label }) => (
          <List.Item key={label}>
            <PasswordRequirementItem
              status={getPasswordStatus(ruleKey, passwordValidations)}
              text={label}
            />
          </List.Item>
        ))}
      </List>
    </Box>
  ) : null;
};

export default PasswordRequirements;
