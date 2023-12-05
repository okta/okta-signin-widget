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

import {
  GlobalStyles as MuiGlobalStyles,
  GlobalStylesProps,
} from '@mui/material';
import { DesignTokens, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';

// TODO we could scope these to just widget container
const svgStyles = (Tokens: DesignTokens): GlobalStylesProps['styles'] => ({
  '.siwFillPrimary': {
    fill: Tokens.PalettePrimaryMain,
  },
  '.siwFillPrimaryDark': {
    fill: Tokens.PalettePrimaryDark,
  },
  '.siwFillSecondary': {
    fill: Tokens.PalettePrimaryLight,
  },
  '.siwFillBg': {
    fill: Tokens.HueNeutral50,
  },
  '.siwIconFillPrimaryDark': {
    fill: Tokens.PalettePrimaryDark,
  },
  '.siwIconFillSecondary': {
    fill: Tokens.PalettePrimaryLight,
  },
});

const GlobalStyles: FunctionComponent = () => {
  const Tokens = useOdysseyDesignTokens();

  return (
    <MuiGlobalStyles
      styles={svgStyles(Tokens)}
    />
  );
};

export default GlobalStyles;
