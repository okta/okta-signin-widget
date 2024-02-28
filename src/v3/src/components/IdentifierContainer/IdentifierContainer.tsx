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
import { Tag, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { UserIcon } from '@okta/odyssey-react-mui/icons';
import { h } from 'preact';
import { IdentifierContainerElement, UISchemaElementComponent } from 'src/types';

import { loc } from '../../util';

const IdentifierContainer: UISchemaElementComponent<{
  uischema: IdentifierContainerElement
}> = ({ uischema }) => {
  const { options: { identifier } } = uischema;
  const tokens = useOdysseyDesignTokens();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      marginBlockEnd={tokens.Spacing4}
      maxWidth={1}
      title={identifier}
      data-se="identifier-container"
    >
      <Tag
        icon={(
          <Box
            sx={{
              width: tokens.Spacing4,
              height: tokens.Spacing4,
            }}
          >
            <UserIcon
              titleAccess={loc('identifier.icon.alt.text', 'login')}
              sx={{
                color: tokens.PalettePrimaryMain,
                width: tokens.Spacing4,
                height: tokens.Spacing4,
              }}
            />
          </Box>
        )}
        label={identifier}
        testId="identifier"
        translate="no"
      />
    </Box>
  );
};

export default IdentifierContainer;
