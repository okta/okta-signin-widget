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
import { useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { CheckCircleFilledIcon, CloseIcon, InformationCircleIcon } from '@okta/odyssey-react-mui/icons';
import { FunctionComponent, h } from 'preact';

import { PasswordRequirementStatus } from '../../types';

type PasswordRequirementIconProps = {
  status: PasswordRequirementStatus;
};

const Icon: FunctionComponent<PasswordRequirementIconProps> = (
  props,
) => {
  const { status } = props;
  const tokens = useOdysseyDesignTokens();
  const statusToIcon = {
    incomplete: { component: CloseIcon, color: tokens.PaletteNeutralMain },
    complete: { component: CheckCircleFilledIcon, color: tokens.PaletteSuccessMain },
    info: { component: InformationCircleIcon, color: tokens.PalettePrimaryMain },
  };
  const OdyIcon = statusToIcon[status].component;

  return (
    <Box
      data-se={`passwordRequirementIcon-${status}`}
      sx={{
        marginInlineEnd: tokens.Spacing2,
        // This is to force the icon align with the top of the text
        marginBlockStart: '2px',
      }}
      aria-hidden
    >
      <OdyIcon
        sx={{
          color: statusToIcon[status].color,
        }}
      />
    </Box>
  );
};
export default Icon;
