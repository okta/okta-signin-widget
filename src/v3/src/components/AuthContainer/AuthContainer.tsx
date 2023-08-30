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

import { useMediaQuery, GlobalStyles } from '@mui/material';
import * as Tokens from '@okta/odyssey-design-tokens';
import { Box } from '@okta/odyssey-react-mui';
import classNames from 'classnames';
import { FunctionComponent, h } from 'preact';

import { useWidgetContext } from '../../contexts';

const AuthContainer: FunctionComponent<{ hide: boolean }> = ({ children, hide }) => {
  const { languageDirection, languageCode } = useWidgetContext();
  const classes = classNames('auth-container', 'main-container');
  const isMobileWidth = useMediaQuery('screen and (max-width: 391px)');

  return (
    <Box
      id="okta-sign-in"
      component="main"
      display="flex"
      justifyContent="center"
      alignItems="center"
      className={classes}
      data-version={OKTA_SIW_VERSION}
      data-commit={OKTA_SIW_COMMIT_HASH}
      lang={languageCode}
      dir={languageDirection}
      sx={{
        minInlineSize: '100%',
        marginBlockStart: '100px',
        marginBlockEnd: '8px',
        marginInline: 'auto',
        '@media only screen and (max-device-width: 750px)': {
          marginBlockStart: 0,
        },
        ...(hide ? {
          display: 'none',
        } : {}),
      }}
    >
      {/* Global fill styles used by SVGs */}
      <GlobalStyles
        styles={(theme) => ({
          '.siwFillPrimary': {
            fill: theme.palette.primary.main,
          },
          '.siwFillPrimaryDark': {
            fill: theme.palette.primary.dark,
          },
          '.siwFillSecondary': {
            fill: theme.palette.primary.light,
          },
          '.siwFillBg': {
            fill: theme.palette.grey[50],
          },
          '.siwIconFillPrimary': {
            fill: theme.palette.primary.main,
          },
          '.siwIconStrokePrimary': {
            stroke: theme.palette.primary.main,
          },
          '.siwIconFillPrimaryDark': {
            fill: theme.palette.primary.dark,
          },
          '.siwIconFillSecondary': {
            fill: theme.palette.primary.light,
          },
        })}
      />
      <Box
        flex="auto"
        flexDirection="column"
        border={isMobileWidth ? 0 : 1}
        borderRadius={1}
        borderColor={Tokens.ColorBorderDisplay}
        bgcolor="common.white"
        fontFamily="fontFamily"
        sx={{
          maxInlineSize: '432px',
          minInlineSize: '320px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AuthContainer;
