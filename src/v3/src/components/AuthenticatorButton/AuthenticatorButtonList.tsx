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
import { h } from 'preact';

import {
  AuthenticatorButtonElement,
  AuthenticatorButtonListElement,
  UISchemaElementComponent,
} from '../../types';
import AuthenticatorButton from './AuthenticatorButton';

const AuthenticatorButtonList: UISchemaElementComponent<{
  uischema: AuthenticatorButtonListElement
}> = ({ uischema }) => {
  const { buttons, dataSe } = uischema.options;
  const tokens = useOdysseyDesignTokens();

  return (
    <Box
      component="ul"
      data-se={dataSe}
      sx={{
        listStyle: 'none',
        padding: tokens.Spacing0,
        marginBlockStart: tokens.Spacing0,
      }}
    >
      {
        buttons.map((button: AuthenticatorButtonElement, index: number) => (
          <Box
            key={button.id}
            component="li"
            sx={{ marginBlockEnd: tokens.Spacing4 }}
          >
            <AuthenticatorButton
              uischema={{
                ...button,
                focus: index === 0 ? uischema.focus : false,
                ariaDescribedBy: uischema.ariaDescribedBy,
              }}
            />
          </Box>
        ))
      }
    </Box>
  );
};
export default AuthenticatorButtonList;
