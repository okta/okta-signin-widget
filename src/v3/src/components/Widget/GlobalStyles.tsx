/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { FunctionComponent, h } from 'preact';
import {
  GlobalStyles as MuiGlobalStyles,
  GlobalStylesProps,
  Theme,
} from '@mui/material';
import { merge } from 'lodash';

// TODO we could scope these to just widget container
const svgStyles = (theme: Theme): GlobalStylesProps['styles'] => ({
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
});
const loginPageUtilityStyles = (): GlobalStylesProps['styles'] => ({
  '.clearfix': {
    display: 'block',
  },
  '.clearfix:after, .clearfix:before': {
    display: 'block',
    blockSize: 0,
    clear: 'both',
    content: '"."',
    visibility: 'hidden',
  },
  '.hide': {
    display: 'none',
  },
});
const loginPageFooterStyles = (): GlobalStylesProps['styles'] => ({
  '.auth .footer': {
    backgroundColor: 'white',
    minInlineSize: '300px',
    position: 'absolute',
    fontSize: '12px',
    insetInline: 0,
    insetBlockEnd: 0,
    blockSize: '34px',
    overflow: 'hidden',
  },
  '.auth .footer .footer-container': {
    paddingBlock: '9px',
    paddingInline: '80px',
    marginBlock: 0,
    marginInline: 'auto',
    boxSizing: 'border-box',
  },
  '@media only screen and (max-width: 560px)': {
    '.auth .footer .footer-container': {
      inlineSize: '400px',
      paddingInline: '20px',
    },
  },
  '@media only screen and (max-width: 400px)': {
    '.auth .footer .footer-container': {
      inlineSize: '100%',
    },
  },
  '.auth .footer a': {
    color: '#6e6e78',
  },
  '.auth .footer a:active, .auth .footer a:link, .auth .footer a:visited': {
    textDecoration: 'none',
    color: '#6e6e78',
  },
  '.auth .footer a:focus, .auth .footer a:hover': {
    textDecoration: 'underline',
    color: '#6e6e78',
  },
  '.auth .footer .copyrightj': {
    float: 'left',
    /* TODO: OKTA-586564 replace hardcoded value */
    color: '#6e6e78',
  },
  '.auth .footer .copyright a': {
    /* TODO: OKTA-586564 replace hardcoded value */
    color: '#6e6e78',
  },
  '.auth .footer .privacy-policy': {
    float: 'right',
  },
});
const loginPageContainerStyles = (): GlobalStylesProps['styles'] => ({
  '.auth .content': {
    minBlockSize: '100%',
    minInlineSize: '300px',
    display: 'inline-block',
    inlineSize: '100%',
  },
  '.auth .content:after': {
    content: '""',
    display: 'block',
    blockSize: '30px',
  },
  '.okta-container .applogin-banner': {
    position: 'relative',
    marginBlockEnd: '10px',
    minInlineSize: '300px',
  },
  '.okta-container .applogin-banner .applogin-background': {
    backgroundColor: 'white',
    opacity: 0.9,
    position: 'absolute',
    inset: 0,
    boxShadow: '0 0 2px 1px hsla(0, 0%, 68.6%, 0.3)',
  },
  '.okta-container .applogin-banner .applogin-container': {
    position: 'relative',
    inlineSize: '400px',
    minInlineSize: '300px',
    marginBlock: 0,
    marginInline: 'auto',
    paddingBlock: '20px',
    paddingInline: 0,
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  '.okta-container .applogin-banner .applogin-container p': {
    /* TODO: OKTA-586564 replace hardcoded value */
    color: '#6e6e78',
  },
  '@media only screen and (max-width: 400px)': {
    '.okta-container .applogin-banner .applogin-container': {
      inlineSize: '100%',
    },
  },
  '@media only screen and (max-height: 750px)': {
    '.okta-container .applogin-banner .applogin-container': {
      paddingBlock: '10px',
      paddingInline: 0,
    },
  },
  '@media only screen and (max-height: 660px)': {
    '.okta-container .applogin-banner .applogin-container': {
      paddingBlock: '5px',
      paddingInline: 0,
    },
    '.okta-container .applogin-banner .applogin-container p': {
      display: 'none',
    },
  },
  '.okta-container .applogin-banner .applogin-container h1': {
    fontSize: '24px',
    fontWeight: 'lighter',
    lineHeight: '26px',
  },
  '.okta-container .applogin-banner .applogin-app-logo': {
    display: 'inline-block',
    verticalAlign: 'middle',
    marginInlineStart: '5px',
  },
  '.okta-container .applogin-banner .applogin-app-logo img': {
    maxBlockSize: '26px',
  },
  '.login-bg-image': {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '50%',
    backgroundSize: 'cover',
    position: 'fixed',
    inset: 0,
    zIndex: -5,
  },
  '@media only screen and (max-width: 600px)': {
    '.login-bg-image': {
      backgroundImage: 'none !important',
      backgroundColor: 'white !important',
      filter: 'unset !important',
    },
  },
});

const GlobalStyles: FunctionComponent = () => {
  return (
    <MuiGlobalStyles
      styles={(theme) => merge(
        svgStyles(theme),
        loginPageUtilityStyles(),
        loginPageFooterStyles(),
        loginPageContainerStyles(),
      )}
    />
  )
};

export default GlobalStyles;