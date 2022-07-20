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
import { useTranslation } from '../../lib/okta-i18n';
import {
  PasswordRequirementsElement,
  PasswordRequirementStatus,
  PasswordValidation,
  UISchemaElementComponent,
  Undefinable,
} from '../../types';
import { validatePassword } from '../../util';
import PasswordRequirementItem from './PasswordRequirementItem';
import {
  buildPasswordRequirementListItems,
} from './passwordRequirementsData';

const PasswordRequirements: UISchemaElementComponent<{
  uischema: PasswordRequirementsElement
}> = ({ uischema }) => {
  const { data } = useWidgetContext();
  const {
    id,
    data: passwordRequirements,
    userInfo,
    fieldKey,
    validationDelayMs,
  } = uischema.options as PasswordRequirementsElement['options'];
  const password = get(data, fieldKey);
  const items = buildPasswordRequirementListItems(passwordRequirements);
  const { t } = useTranslation();

  const [passwordValidations, setPasswordValidations] = useState<PasswordValidation>({});

  const getPasswordStatus = (
    ruleKey: string,
    passwordValidation: PasswordValidation,
  ): Undefinable<PasswordRequirementStatus> => {
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
    if (!passwordRequirements) {
      setPasswordValidations({});
      return;
    }

    const validations = validatePassword(pw, userInfo, passwordRequirements);
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

  return items?.length > 0 ? (
    <Box data-se="password-authenticator--rules">
      <Box marginBottom={2}>
        <Text as="span">{t('password.complexity.requirements.header')}</Text>
      </Box>
      <List
        id={id}
        listType="unordered"
        unstyled
      >
        {items.map(({ ruleKey, label, value }) => (
          <List.Item key={label}>
            <PasswordRequirementItem
              status={getPasswordStatus(ruleKey, passwordValidations)}
              text={t(label, [value])}
            />
          </List.Item>
        ))}
      </List>
    </Box>
  ) : null;
};

export default PasswordRequirements;
