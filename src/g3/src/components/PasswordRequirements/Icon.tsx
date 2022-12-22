/*
 * Copyright (c) 2022-present, Okta, Inc. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant
 * to the Apache License, Version 2.0 (the "License.")
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Box } from '@mui/material';
import { Icon as OdyIcon } from '@okta/odyssey-react';
import { withTheme } from '@okta/odyssey-react-theme';
import classNames from 'classnames/bind';
import { FunctionComponent, h } from 'preact';

import { PasswordRequirementStatus } from '../../types';
import { theme } from './PasswordRequirements.theme';
import style from './style.module.css';

const cx = classNames.bind(style);

type PasswordRequirementIconProps = {
  status: PasswordRequirementStatus;
};

const Icon: FunctionComponent<PasswordRequirementIconProps> = (
  props,
) => {
  const { status } = props;
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
    <Box className={iconClasses}>
      <OdyIcon
        // TODO: OKTA-556721 - Create and use loc string here for requirement status
        title={status}
        name={statusToIconName[status]}
      />
    </Box>
  );
};
export default withTheme(theme, style)(Icon);
