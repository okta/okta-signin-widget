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

import { odysseyTheme } from '@okta/odyssey-react-mui';
import chroma from 'chroma-js';
import { cloneDeep } from 'lodash';

import { Brand } from '../types';
import { DESIGN_TOKENS, DesignTokensType } from './designTokens';
import { mergeThemes } from './mergeThemes';

type Palette = {
  main: string;
  light: string;
  lighter: string;
  dark: string;
  contrastText: string;
};

type Theme = typeof odysseyTheme;

const WHITE = '#ffffff';
const BLACK = '#1d1d21';

const getInverseTextColor = (primaryColor: string): string => (
  chroma.contrast(primaryColor, WHITE) > 4.5 ? WHITE : BLACK
);

export const createPalette = (main: string): Palette => {
  const lightness = chroma(main).get('hsl.l')
  const isBright = lightness > 0.24;
  if (isBright) {
    return {
      main: main,
      lighter: chroma(main)
        .set('hsl.h', '+9')
        .set('hsl.s', '+0.18')
        .set('hsl.l', 0.97)
        .hex(),
      light: chroma(main)
        .set('hsl.h', '+11')
        .set('hsl.s', '-0.18')
        .set('hsl.l', lightness < 0.59 ? '+0.31' : 0.9) // clamp lightness
        .hex(),
      dark: chroma(main)
        .set('hsl.h', '+3')
        .set('hsl.s', '+0.18')
        .set('hsl.l', '-0.24')
        .hex(),
      contrastText: getInverseTextColor(main),
    };
  }

  return {
    main: main,
    lighter: chroma(main)
      .set('hsl.h', '+9')
      .set('hsl.s', '+0.18')
      .set('hsl.l', 0.97)
      .hex(),
    light: chroma(main)
      .set('hsl.l', '+0.62')
      .hex(),
    dark: chroma(main)
      .set('hsl.l', '+0.31')
      .hex(),
    contrastText: getInverseTextColor(main),
  };
};

export const mapMuiThemeFromBrand = (
  brand?: Brand,
  customTokens?: Partial<DesignTokensType>,
): Theme => {
  const odysseyTokens = DESIGN_TOKENS;
  const tokens: DesignTokensType = { ...odysseyTokens, ...customTokens };

  // TODO: OKTA-517723 temporary override until odyssey-react-mui theme
  // borderRadius value is fixed
  odysseyTheme.shape.borderRadius = 4;

  // Do not modify `odysseyTheme` after this line, it will have no effect on the
  // resulting theme
  const theme = cloneDeep(odysseyTheme);

  theme.palette.text.primary = BLACK;

  // apply brand customizations
  if (brand?.primaryColor) {
    theme.palette.primary = createPalette(brand.primaryColor);
  }

  // apply custom design tokens
  if (customTokens) {
    // theme.palette
    if (customTokens.PalettePrimaryMain) {
      const p = createPalette(customTokens.PalettePrimaryMain);
      theme.palette.primary.lighter = customTokens.PalettePrimaryLighter ?? p.lighter;
      theme.palette.primary.light = customTokens.PalettePrimaryLight ?? p.light;
      theme.palette.primary.main = customTokens.PalettePrimaryMain;
      theme.palette.primary.dark = customTokens.PalettePrimaryDark ?? p.dark;
    }

    if (customTokens.PaletteDangerMain) {
      const p = createPalette(customTokens.PaletteDangerMain);
      theme.palette.error.lighter = customTokens.PaletteDangerLighter ?? p.lighter;
      theme.palette.error.light = customTokens.PaletteDangerLight ?? p.light;
      theme.palette.error.main = customTokens.PaletteDangerMain;
      theme.palette.error.dark = customTokens.PaletteDangerDark ?? p.dark;
    }
    if (customTokens.PaletteWarningMain) {
      const p = createPalette(customTokens.PaletteWarningMain);
      theme.palette.warning.lighter = customTokens.PaletteWarningLighter ?? p.lighter;
      theme.palette.warning.light = customTokens.PaletteWarningLight ?? p.light;
      theme.palette.warning.main = customTokens.PaletteWarningMain;
      theme.palette.warning.dark = customTokens.PaletteWarningDark ?? p.dark;
    }
    if (customTokens.PaletteSuccessMain) {
      const p = createPalette(customTokens.PaletteSuccessMain);
      theme.palette.success.lighter = customTokens.PaletteSuccessLighter ?? p.lighter;
      theme.palette.success.light = customTokens.PaletteSuccessLight ?? p.light;
      theme.palette.success.main = customTokens.PaletteSuccessMain;
      theme.palette.success.dark = customTokens.PaletteSuccessDark ?? p.dark;
    }
    // theme.mixins.border*
    if (customTokens.BorderRadiusMain) {
      theme.mixins.borderRadius = customTokens.BorderRadiusMain;
    }
    if (customTokens.BorderStyleMain) {
      theme.mixins.borderStyle = customTokens.BorderStyleMain;
    }
    if (customTokens.BorderWidthMain) {
      theme.mixins.borderWidth = customTokens.BorderWidthMain;
    }

    // theme.shadows
    if (customTokens.ShadowScale0) {
      theme.shadows[1] = customTokens.ShadowScale0;
    }
    if (customTokens.ShadowScale1) {
      theme.shadows[2] = customTokens.ShadowScale1;
    }

    // theme.palette.text
    if (customTokens.TypographyColorBody) {
      theme.palette.text.primary = customTokens.TypographyColorBody;
    }
    if (customTokens.TypographyColorDisabled) {
      theme.palette.text.disabled = customTokens.TypographyColorDisabled;
    }

    // theme.text
    if (customTokens.TypographySizeHeading1) {
      theme.typography.h1.fontSize = customTokens.TypographySizeHeading1;
    }
    if (customTokens.TypographySizeHeading2) {
      theme.typography.h2.fontSize = customTokens.TypographySizeHeading2;
    }
    if (customTokens.TypographySizeHeading3) {
      theme.typography.h3.fontSize = customTokens.TypographySizeHeading3;
    }
    if (customTokens.TypographySizeHeading4) {
      theme.typography.h4.fontSize = customTokens.TypographySizeHeading4;
    }
    if (customTokens.TypographySizeHeading5) {
      theme.typography.h5.fontSize = customTokens.TypographySizeHeading5;
    }
    if (customTokens.TypographySizeHeading6) {
      theme.typography.h6.fontSize = customTokens.TypographySizeHeading6;
    }
    if (customTokens.TypographySizeBody) {
      theme.typography.body1.fontSize = customTokens.TypographySizeBody;
    }
    if (customTokens.TypographyLineHeightHeading1) {
      theme.typography.h1.lineHeight = customTokens.TypographyLineHeightHeading1;
    }
    if (customTokens.TypographyLineHeightHeading2) {
      theme.typography.h2.lineHeight = customTokens.TypographyLineHeightHeading2;
    }
    if (customTokens.TypographyLineHeightHeading3) {
      theme.typography.h3.lineHeight = customTokens.TypographyLineHeightHeading3;
    }
    if (customTokens.TypographyLineHeightHeading4) {
      theme.typography.h4.lineHeight = customTokens.TypographyLineHeightHeading4;
    }
    if (customTokens.TypographyLineHeightHeading5) {
      theme.typography.h5.lineHeight = customTokens.TypographyLineHeightHeading5;
    }
    if (customTokens.TypographyLineHeightHeading6) {
      theme.typography.h6.lineHeight = customTokens.TypographyLineHeightHeading6;
    }

    theme.spacing = (n) => {
      return [
        customTokens.Spacing0 ?? odysseyTokens.Spacing0,
        customTokens.Spacing1 ?? odysseyTokens.Spacing1,
        customTokens.Spacing2 ?? odysseyTokens.Spacing2,
        customTokens.Spacing3 ?? odysseyTokens.Spacing3,
        customTokens.Spacing4 ?? odysseyTokens.Spacing4,
        customTokens.Spacing5 ?? odysseyTokens.Spacing5,
        customTokens.Spacing6 ?? odysseyTokens.Spacing6,
        customTokens.Spacing7 ?? odysseyTokens.Spacing7,
        customTokens.Spacing8 ?? odysseyTokens.Spacing8,
        customTokens.Spacing9 ?? odysseyTokens.Spacing9,
      ][n];
    }
  }

  return mergeThemes(theme, {
    components: {
      MuiInputLabel: {
        styleOverrides: {
          root: {
            wordBreak: 'break-word',
            whiteSpace: 'normal',
          },
        },
      }
    }
  }) as Theme;
};
