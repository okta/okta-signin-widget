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

import { Tag, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { UserIcon } from '@okta/odyssey-react-mui/icons';
import { Box } from '@okta/odyssey-react-mui-legacy';
import classNames from 'classnames';
import { h } from 'preact';
import { IdentifierContainerElement, UISchemaElementComponent } from 'src/types';

const IdentifierContainer: UISchemaElementComponent<{
  uischema: IdentifierContainerElement
}> = ({ uischema }) => {
  const { options: { identifier } } = uischema;

  const mainContainerClasses = classNames('identifier-container', 'no-translate');
  const tokens = useOdysseyDesignTokens();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      marginBlockEnd={4}
      maxWidth={1}
      className={mainContainerClasses}
      title={identifier}
    >
      <Tag
        icon={(
          <Box
            sx={{
              width: '16px',
              height: '16px',
            }}
          >
            <UserIcon
              titleAccess="User"
              sx={{
                color: tokens.PalettePrimaryMain,
                width: '16px',
                height: '16px',
              }}
            />
          </Box>
        )}
        label={identifier}
        testId="identifier"
      />
    </Box>
  );
};

export default IdentifierContainer;
