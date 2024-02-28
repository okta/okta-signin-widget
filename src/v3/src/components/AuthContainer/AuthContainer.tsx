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

import { Box, ScopedCssBaseline } from '@mui/material';
import { useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';

import { useWidgetContext } from '../../contexts';

const AuthContainer: FunctionComponent<{ hide: boolean }> = ({ children, hide }) => {
  const { languageDirection, languageCode } = useWidgetContext();
  const testIds = 'auth-container main-container';
  const tokens = useOdysseyDesignTokens();

  return (
    <Box
      id="okta-sign-in"
      component="main"
      data-se={testIds}
      data-version={OKTA_SIW_VERSION}
      data-commit={OKTA_SIW_COMMIT_HASH}
      lang={languageCode}
      dir={languageDirection}
      sx={{
        // NOTE: Do not add sx to this component. Styles must be nested beneath
        // this element with `dir` for CSS logical property transforms to work.
      }}
    >
      {/* the style is to allow the widget to inherit the parent's bg color */}
      <ScopedCssBaseline
        sx={{
          backgroundColor: 'inherit',
          'span.strong': {
            fontWeight: 'bold',
            wordBreak: 'break-all',
          },
          display: hide ? 'none' : 'block',
        }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            minInlineSize: '100%',
            marginBlockStart: '100px',
            marginInline: 'auto',
          }}
        >
          <Box
            flex="auto"
            flexDirection="column"
            bgcolor="common.white"
            sx={{
              maxInlineSize: '432px',
              minInlineSize: '320px',
              borderWidth: tokens.BorderWidthMain,
              borderStyle: tokens.BorderStyleMain,
              borderRadius: tokens.Spacing3,
              borderColor: tokens.BorderColorDisplay,
              '@media only screen and (max-width: 391px)': {
                borderWidth: 0,
              },
            }}
          >
            {children}
          </Box>
        </Box>
      </ScopedCssBaseline>
    </Box>
  );
};

export default AuthContainer;
