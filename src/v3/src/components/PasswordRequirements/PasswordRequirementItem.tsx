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

import { Box, Icon } from '@okta/odyssey-react';
import { withTheme } from '@okta/odyssey-react-theme';
import classNames from 'classnames/bind';
import { FunctionComponent, h } from 'preact';

import { PasswordRequirementProps } from '../../types';
import { theme } from './PasswordRequirements.theme';
import style from './style.module.css';

const cx = classNames.bind(style);

const PasswordRequirement: FunctionComponent<PasswordRequirementProps> = (
  props,
) => {
  const { status, text } = props;
  const statusToIconName = {
    incomplete: 'close',
    complete: 'check-circle-filled',
    info: 'information-circle-filled',
  };
  const iconClasses = cx('passwordRequirementIcon', {
    complete: status === 'complete',
    incomplete: status === 'incomplete',
    info: status === 'info',
  });

  return (
    // @ts-ignore OKTA-471233
    <Box>
      {
        status && (
          // @ts-ignore OKTA-471233
          <Box
            display="inline-block"
            marginRight="xs"
            className={iconClasses}
          >
            <Icon
              title={status}
              name={statusToIconName[status]}
            />
          </Box>
        )
      }
      {/* @ts-ignore OKTA-471233 */}
      <Box as="span">{text}</Box>
    </Box>
  );
};
export default withTheme(theme, style)(PasswordRequirement);
