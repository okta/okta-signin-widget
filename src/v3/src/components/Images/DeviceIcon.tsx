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
import { DevicesIcon } from '@okta/odyssey-react-mui/icons';
import { FunctionComponent, h } from 'preact';

import { loc } from '../../util';

export const DeviceIcon: FunctionComponent = () => {
  const tokens = useOdysseyDesignTokens();

  return (
    <DevicesIcon
      sx={{
        color: tokens.PalettePrimaryMain,
        width: tokens.Spacing4,
        height: tokens.Spacing4,
      }}
      titleAccess={loc('icon.title.browser', 'login')}
      aria-hidden
    />
  );
};
