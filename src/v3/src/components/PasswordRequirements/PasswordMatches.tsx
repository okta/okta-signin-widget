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
  List,
} from '@okta/odyssey-react';
import debounce from 'lodash/debounce';
import { h } from 'preact';
import {
  useCallback,
  useEffect,
  useState,
} from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import {
  PasswordMatchesElement,
  UISchemaElementComponent,
} from '../../types';
import { getTranslation, loc } from '../../util';
import PasswordRequirementItem from './PasswordRequirementItem';

const PasswordMatches: UISchemaElementComponent<{
  uischema: PasswordMatchesElement
}> = ({ uischema }) => {
  const { data } = useWidgetContext();
  const { validationDelayMs } = uischema.options as PasswordMatchesElement['options'];
  const password = 'credentials.newPassword' in data
    ? data['credentials.newPassword']
    : data['credentials.passcode'];
  const { confirmPassword } = data;
  const { translations = [] } = uischema;
  const label = getTranslation(translations, 'label');

  const [isMatching, setIsMatching] = useState<boolean>(false);

  const onValidatePassword = (pw: string, confirmPw: string): void => {
    setIsMatching(pw === confirmPw);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const passwordValidationHandler = useCallback(
    debounce(onValidatePassword, validationDelayMs), [validationDelayMs],
  );

  useEffect(() => {
    passwordValidationHandler((password ?? '') as string, confirmPassword as string);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, confirmPassword]);

  return (
    <Box data-se="password-authenticator--matches">
      <List
        listType="unordered"
        unstyled
      >
        <List.Item>
          <PasswordRequirementItem
            status={isMatching ? 'complete' : 'incomplete'}
            text={label ?? ''}
          />
        </List.Item>
      </List>
    </Box>
  );
};

export default PasswordMatches;
