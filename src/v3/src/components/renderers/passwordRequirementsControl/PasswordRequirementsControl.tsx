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
  Box, List, Text,
} from '@okta/odyssey-react';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import { FunctionComponent, h } from 'preact';
import {
  useCallback,
  useEffect,
  useState,
} from 'preact/hooks';

import { useTranslation } from '../../../lib/okta-i18n';
import { CellPropsWithContext, PasswordRequirementsElement, Undefinable } from '../../../types';
import { validatePassword } from '../../../util';
import PasswordRequirement from './PasswordRequirement';
import {
  buildPasswordRequirementListItems,
  PasswordRequirementStatus,
  PasswordValidation,
} from './passwordRequirementsData';

const PasswordRequirementsControl: FunctionComponent<CellPropsWithContext> = (props) => {
  const { props: { uischema: element }, ctx } = props;
  const {
    id,
    data,
    userInfo,
    fieldKey,
    validationDelayMs,
  } = element.options as PasswordRequirementsElement['options'];
  const passwordRequirements = data;
  const password = get(ctx?.core?.data, fieldKey);
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
    passwordValidationHandler(password ?? '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  return (
    // @ts-ignore OKTA-471233
    <Box marginBottom="m">
      <Text as="span">{t('password.requirements')}</Text>
      <List
        id={id}
        listType="unordered"
        unstyled
      >
        {items.map(({ ruleKey, label, value }) => (
          <List.Item key={label}>
            <PasswordRequirement
              status={getPasswordStatus(ruleKey, passwordValidations)}
              text={t(label, [value])}
            />
          </List.Item>
        ))}
      </List>
    </Box>
  );
};

export default PasswordRequirementsControl;
