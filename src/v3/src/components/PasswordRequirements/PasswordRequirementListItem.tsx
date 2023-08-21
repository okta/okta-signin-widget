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

import * as Tokens from '@okta/odyssey-design-tokens';
import { Box, Typography } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';

import { PasswordRequirementProps } from '../../types';
import Icon from './Icon';

const PasswordRequirementListItem: FunctionComponent<PasswordRequirementProps> = (
  props,
) => {
  const { status, label } = props;

  return (
    <Box
      component="li"
      sx={{ marginBlockEnd: (theme) => theme.spacing(2) }}
      color={status === 'complete' ? Tokens.ColorPaletteGreen600 : undefined}
    >
      <Box
        display="flex"
        alignItems="center"
      >
        <Icon status={status} />
        <Box><Typography variant="body1">{label}</Typography></Box>
      </Box>
    </Box>
  );
};
export default PasswordRequirementListItem;
