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

import { Box } from '@okta/odyssey-react';
import { withTheme } from '@okta/odyssey-react-theme';
import { FunctionComponent, h } from 'preact';
import { AuthCoinTheme } from 'src/types';
import { AuthenticatorOptionValue, Option } from 'src/types/jsonforms';

import ArrowRight from '../../../img/authenticatorList/arrow-right.svg';
import { useTranslation } from '../../../lib/okta-i18n';
import AuthCoin from '../../AuthCoin/AuthCoin';
import { theme } from './AuthenticatorListControl.theme';
import style from './styles.module.css';

interface AuthenticatorItemProps {
  option: Option<AuthenticatorOptionValue>
  theme?: AuthCoinTheme,
}

const AuthenticatorItem: FunctionComponent<AuthenticatorItemProps> = ({ option }) => {
  const { t } = useTranslation();
  const descriptionParams = option.descriptionParams?.map((param) => t(param));
  return (
    // @ts-ignore OKTA-471233
    <Box
      display="flex"
      padding="s"
    >
      { option.key && <AuthCoin authenticatorKey={option.key} /> }
      {/* @ts-ignore OKTA-471233 */}
      <Box className={style.infoSection}>
        {/* @ts-ignore OKTA-471233 */}
        <Box className={style.title}>
          {option.label}
        </Box>
        {option.description && (
          // @ts-ignore OKTA-471233
          <Box className={style.description}>
            {t(option.description, descriptionParams)}
          </Box>
        )}
        {/* @ts-ignore OKTA-471233 */}
        <Box className={style.actionName}>
          {t(option.value.label)}
          <ArrowRight />
        </Box>
      </Box>
    </Box>
  );
};
export default withTheme(theme, style)(AuthenticatorItem);
