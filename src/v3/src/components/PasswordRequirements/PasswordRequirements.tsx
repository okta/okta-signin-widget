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

import { useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { Box } from '@okta/odyssey-react-mui-legacy';
import debounce from 'lodash/debounce';
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
import PasswordRequirementListItem from './PasswordRequirementListItem';

const PasswordRequirements: UISchemaElementComponent<{
  uischema: PasswordRequirementsElement
}> = ({ uischema }) => {
  const { data } = useWidgetContext();
  const {
    header,
    id: listId,
    requirements,
    settings,
    userInfo,
    validationDelayMs,
  } = uischema.options as PasswordRequirementsElement['options'];
  // TODO: OKTA-521321 - Depending on the outcome of this ticket, we may be able to remove this
  // If it is kept, need to add integration test for validation
  const password = 'credentials.newPassword' in data
    ? data['credentials.newPassword']
    : data['credentials.passcode'];

  const [passwordValidations, setPasswordValidations] = useState<PasswordValidation>({});
  const tokens = useOdysseyDesignTokens();

  const getPasswordStatus = (
    ruleKey: string,
    passwordValidation: PasswordValidation,
  ): PasswordRequirementStatus => {
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
    <Box
      component="figure"
      sx={{ marginBlock: 0, marginInline: 0 }}
      data-se="password-authenticator--rules"
      id={uischema.id}
    >
      <Box
        component="figcaption"
        className="password-authenticator--heading"
      >
        {header}
      </Box>
      <Box
        component="ul"
        id={listId}
        sx={{ listStyle: 'none', padding: '0', marginBlockStart: tokens.Spacing3 }}
      >
        {requirements.map(({ ruleKey, label }) => (
          <PasswordRequirementListItem
            key={label}
            status={getPasswordStatus(ruleKey, passwordValidations)}
            label={label}
          />
        ))}
      </Box>
    </Box>
  ) : null;
};

export default PasswordRequirements;
