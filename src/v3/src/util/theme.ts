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

import { ThemeOptions } from '@mui/material';
import { odysseyTheme } from '@okta/odyssey-react-mui';
import chroma from 'chroma-js';
import { set as _set } from 'lodash';

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

const WHITE_HEX = '#ffffff';
const BLACK_HEX = '#1d1d21';

/**
 * Determine whether to use BLACK (#1d1d21) or WHITE (#ffffff) based on a color.
 * If WHITE vs color has a contrast ratio <4.5:1 this will return BLACK.
 * Contrast ratios are symmetrical using the WCAG 2.x algorithm
 *
 * @param color color to compare against black/white
 */
const getInverseTextColor = (color: string): string => (
  chroma.contrast(color, WHITE_HEX) > 4.5 ? WHITE_HEX : BLACK_HEX
);

/**
 * Sets the design token to theme path iff the value is not undefined, i.e.,
 * null, false, 0, etc. will be set. Only undefined will be ignored. Paths and
 * values are not checked for type safety.
 *
 * @param obj {Theme} the theme object
 * @param path {string} target path
 * @param val the value to set, if defined.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function set<T extends object, V>(obj: T, path: string | string[], val: V) {
  return val === undefined ? null : _set(obj, path, val);
}

/**
 * Generates a palette based on the "main" (f.k.a. "base") value. Main value
 * corresponds to 500 in the hue-based color scale.
 *
 * Example:
 * PalettePrimaryMain -> HueBlue50
 * PalettePrimaryLighter -> HueBlue300
 * PalettePrimaryLight -> HueBlue500
 * PalettePrimaryDark -> HueBlue700
 *
 * @param main Main color (Hue 500)
 */
export const generatePalette = (main: string): Palette => {
  const lightness = chroma(main).get('hsl.l');
  return lightness > 0.24
    ? {
      main,
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
    } : {
      main,
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

export const createTheme = (
  brand?: Brand,
  customTokens?: Partial<DesignTokensType>,
): ThemeOptions => {
  const defaultTokens = DESIGN_TOKENS;
  const mergedTokens: DesignTokensType = { ...defaultTokens, ...customTokens };
  const theme = odysseyTheme;
  theme.palette.text.primary = BLACK_HEX;
  if (brand?.primaryColor) {
    const palettePrimary = generatePalette(brand.primaryColor);
    const {
      lighter, light, main, dark,
    } = palettePrimary;
    set(theme, 'palette.primary.lighter', lighter);
    set(theme, 'palette.primary.light', light);
    set(theme, 'palette.primary.main', main);
    set(theme, 'palette.primary.dark', dark);
  }
  if (customTokens) {
    if (customTokens.PalettePrimaryMain) {
      const {
        lighter, light, main, dark,
      } = generatePalette(customTokens.PalettePrimaryMain);
      set(theme, 'palette.primary.lighter', customTokens.PalettePrimaryLighter ?? lighter);
      set(theme, 'palette.primary.light', customTokens.PalettePrimaryLight ?? light);
      set(theme, 'palette.primary.main', customTokens.PalettePrimaryMain ?? main);
      set(theme, 'palette.primary.dark', customTokens.PalettePrimaryDark ?? dark);
      mergedTokens.PalettePrimaryLighter = lighter;
      mergedTokens.PalettePrimaryLight = light;
      mergedTokens.PalettePrimaryMain = main;
      mergedTokens.PalettePrimaryDark = dark;
    }
    if (customTokens.PaletteDangerMain) {
      const {
        lighter, light, main, dark,
      } = generatePalette(customTokens.PaletteDangerMain);
      set(theme, 'palette.error.lighter', customTokens.PaletteDangerLighter ?? lighter);
      set(theme, 'palette.error.light', customTokens.PaletteDangerLight ?? light);
      set(theme, 'palette.error.main', customTokens.PaletteDangerMain ?? main);
      set(theme, 'palette.error.dark', customTokens.PaletteDangerDark ?? dark);
      mergedTokens.PaletteDangerLighter = lighter;
      mergedTokens.PaletteDangerLight = light;
      mergedTokens.PaletteDangerMain = main;
      mergedTokens.PaletteDangerDark = dark;
    }
    if (customTokens.PaletteWarningMain) {
      const {
        lighter, light, main, dark,
      } = generatePalette(customTokens.PaletteWarningMain);
      set(theme, 'palette.warning.lighter', customTokens.PaletteWarningLighter ?? lighter);
      set(theme, 'palette.warning.light', customTokens.PaletteWarningLight ?? light);
      set(theme, 'palette.warning.main', customTokens.PaletteWarningMain ?? main);
      set(theme, 'palette.warning.dark', customTokens.PaletteWarningDark ?? dark);
      mergedTokens.PaletteWarningLighter = lighter;
      mergedTokens.PaletteWarningLight = light;
      mergedTokens.PaletteWarningMain = main;
      mergedTokens.PaletteWarningDark = dark;
    }
    if (customTokens.PaletteSuccessMain) {
      const {
        lighter, light, main, dark,
      } = generatePalette(customTokens.PaletteSuccessMain);
      set(theme, 'palette.success.lighter', customTokens.PaletteSuccessLighter ?? lighter);
      set(theme, 'palette.success.light', customTokens.PaletteSuccessLight ?? light);
      set(theme, 'palette.success.main', customTokens.PaletteSuccessMain ?? main);
      set(theme, 'palette.success.dark', customTokens.PaletteSuccessDark ?? dark);
      mergedTokens.PaletteSuccessLighter = lighter;
      mergedTokens.PaletteSuccessLight = light;
      mergedTokens.PaletteSuccessMain = main;
      mergedTokens.PaletteSuccessDark = dark;
    }
    set(theme, 'mixins.borderRadius', mergedTokens.BorderRadiusMain);
    set(theme, 'mixins.borderStyle', mergedTokens.BorderStyleMain);
    set(theme, 'mixins.borderWidth', mergedTokens.BorderWidthMain);
    set(theme, 'palette.text.disabled', mergedTokens.TypographyColorDisabled);
    set(theme, 'palette.text.primary', mergedTokens.TypographyColorBody);
    set(theme, 'shadows[1]', mergedTokens.ShadowScale0);
    set(theme, 'shadows[2]', mergedTokens.ShadowScale1);
    set(theme, 'typography.body1.fontFamily', mergedTokens.TypographyFamilyBody);
    set(theme, 'typography.body1.fontSize', mergedTokens.TypographySizeBody);
    set(theme, 'typography.body1.lineHeight', mergedTokens.TypographyLineHeightBody);
    set(theme, 'typography.body2.fontFamily', mergedTokens.TypographyFamilyBody);
    set(theme, 'typography.body2.fontSize', mergedTokens.TypographySizeBody);
    set(theme, 'typography.body2.lineHeight', mergedTokens.TypographyLineHeightBody);
    set(theme, 'typography.button.fontFamily', mergedTokens.TypographyFamilyButton);
    set(theme, 'typography.caption.color', mergedTokens.TypographyColorSubordinate);
    set(theme, 'typography.caption.fontFamily', mergedTokens.TypographySizeSubordinate);
    set(theme, 'typography.caption.fontSize', mergedTokens.TypographySizeSubordinate);
    set(theme, 'typography.fontFamily', mergedTokens.TypographyFamilyBody);
    set(theme, 'typography.fontWeightBold', mergedTokens.TypographyWeightBodyBold);
    set(theme, 'typography.fontWeightRegular', mergedTokens.TypographyWeightBody);
    set(theme, 'typography.h1.color', mergedTokens.TypographyColorHeading);
    set(theme, 'typography.h1.fontFamily', mergedTokens.TypographyFamilyHeading);
    set(theme, 'typography.h1.fontSize', mergedTokens.TypographySizeHeading1);
    set(theme, 'typography.h1.fontWeight', mergedTokens.TypographyWeightHeading);
    set(theme, 'typography.h1.lineHeight', mergedTokens.TypographyLineHeightHeading1);
    set(theme, 'typography.h2.color', mergedTokens.TypographyColorHeading);
    set(theme, 'typography.h2.fontFamily', mergedTokens.TypographyFamilyHeading);
    set(theme, 'typography.h2.fontSize', mergedTokens.TypographySizeHeading2);
    set(theme, 'typography.h2.fontWeight', mergedTokens.TypographyWeightHeading);
    set(theme, 'typography.h2.lineHeight', mergedTokens.TypographyLineHeightHeading2);
    set(theme, 'typography.h3.color', mergedTokens.TypographyColorHeading);
    set(theme, 'typography.h3.fontFamily', mergedTokens.TypographyFamilyHeading);
    set(theme, 'typography.h3.fontSize', mergedTokens.TypographySizeHeading3);
    set(theme, 'typography.h3.fontWeight', mergedTokens.TypographyWeightHeading);
    set(theme, 'typography.h3.lineHeight', mergedTokens.TypographyLineHeightHeading3);
    set(theme, 'typography.h4.color', mergedTokens.TypographyColorHeading);
    set(theme, 'typography.h4.fontFamily', mergedTokens.TypographyFamilyHeading);
    set(theme, 'typography.h4.fontSize', mergedTokens.TypographySizeHeading4);
    set(theme, 'typography.h4.fontWeight', mergedTokens.TypographyWeightHeading);
    set(theme, 'typography.h4.lineHeight', mergedTokens.TypographyLineHeightHeading4);
    set(theme, 'typography.h5.color', mergedTokens.TypographyColorHeading);
    set(theme, 'typography.h5.fontFamily', mergedTokens.TypographyFamilyHeading);
    set(theme, 'typography.h5.fontSize', mergedTokens.TypographySizeHeading5);
    set(theme, 'typography.h5.fontWeight', mergedTokens.TypographyWeightHeading);
    set(theme, 'typography.h5.lineHeight', mergedTokens.TypographyLineHeightHeading5);
    set(theme, 'typography.h6.color', mergedTokens.TypographyColorHeading);
    set(theme, 'typography.h6.fontFamily', mergedTokens.TypographyFamilyHeading);
    set(theme, 'typography.h6.fontSize', mergedTokens.TypographySizeHeading6);
    set(theme, 'typography.h6.fontWeight', mergedTokens.TypographyWeightHeading);
    set(theme, 'typography.h6.lineHeight', mergedTokens.TypographyLineHeightHeading6);
    set(theme, 'typography.kbd.fontFamily', mergedTokens.TypographyFamilyMono);
    set(theme, 'typography.overline.lineHeight', mergedTokens.TypographyLineHeightOverline);
    set(theme, 'typography.subtitle1.fontFamily', mergedTokens.TypographyFamilyBody);
    set(theme, 'typography.subtitle2.fontFamily', mergedTokens.TypographyFamilyBody);
  }
  return mergeThemes(theme, {
    components: {
      MuiAlert: {
        styleOverrides: {
          root: {
            gap: 0,
          },
          icon: ({ theme: t }) => ({
            paddingInlineEnd: t.spacing(4),
            flexShrink: 0,
          }),
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            '::-ms-reveal': {
              display: 'none',
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            wordBreak: 'break-word',
            whiteSpace: 'normal',
          },
        },
      },
      // ruleset with :focus-visible pseudo-selector break entire ruleset in
      // ie11 because its not supported. re-define the :hover rule separately
      // again so the ruleset is applied in ie11
      MuiButton: {
        styleOverrides: {
          root: ({ ownerState, theme: t }) => ({
            ...(ownerState.variant === 'primary' && {
              '&:hover': {
                backgroundColor: t.palette.primary.dark,
              },
            }),
            ...(ownerState.variant === 'secondary' && {
              '&:hover': {
                backgroundColor: t.palette.primary.lighter,
                borderColor: t.palette.primary.light,
                color: t.palette.primary.main,
              },
            }),
            ...(ownerState.variant === 'floating' && {
              '&:hover': {
                backgroundColor: 'rgba(29, 29, 33, 0.1)',
                borderColor: 'transparent',
              },
            }),
          }),
        },
      },
      // ruleset with :focus-visible pseudo-selector break entire ruleset in
      // ie11 because its not supported. re-define the :hover rule separately
      // again so the ruleset is applied in ie11
      MuiIconButton: {
        styleOverrides: {
          root: () => ({
            '&:hover': {
              backgroundColor: 'rgba(29, 29, 33, 0.1)',
              borderColor: 'transparent',
            },
          }),
        },
      },
    },
  });
};
