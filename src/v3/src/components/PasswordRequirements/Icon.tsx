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

import { Box, Icon as OdyIcon } from '@okta/odyssey-react-mui';
import classNames from 'classnames';
import { FunctionComponent, h } from 'preact';

import { PasswordRequirementStatus } from '../../types';
import { CheckCircle } from '../Icon';

type PasswordRequirementIconProps = {
  status: PasswordRequirementStatus;
};

const Icon: FunctionComponent<PasswordRequirementIconProps> = (
  props,
) => {
  const { status } = props;
  const statusToIconProps = {
    incomplete: { name: 'close', color: 'grey.500' },
    complete: { name: 'check-circle-filled', color: 'success' },
    info: { name: 'information-circle', color: 'info' },
  };
  const iconClasses = classNames('passwordRequirementIcon');

  return (
    <Box
      className={iconClasses}
      sx={(theme) => ({
        marginInlineEnd: theme.spacing(1),
        // This is to force the icon align with the top of the text
        marginBlockStart: '2px',
      })}
      aria-hidden
    >
      {
        // Using a custom Icon for the Success/Check Instead of default ODY Icon
        statusToIconProps[status].name === 'check-circle-filled' ? (
          <CheckCircle
            name="complete"
            description="complete"
          />
        ) : (
          <OdyIcon
            titleAccess={status}
            name={statusToIconProps[status].name}
            color={statusToIconProps[status].color}
          />
        )
      }
    </Box>
  );
};
export default Icon;
