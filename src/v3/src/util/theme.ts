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

import * as Tokens from '@okta/odyssey-design-tokens';
import { createOdysseyMuiTheme, DesignTokensOverride, ThemeOptions } from '@okta/odyssey-react-mui';
import chroma from 'chroma-js';
import { set as _set } from 'lodash';

import { BrandColors } from '../types';
import { mergeThemes } from './mergeThemes';

export type Palette = Partial<{
  main: string;
  light: string;
  lighter: string;
  dark: string;
  contrastText: string;
}>;

export type SpacingArgument = number | string;

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
  chroma.contrast(color, WHITE_HEX) >= 4.5 ? WHITE_HEX : BLACK_HEX
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
  try {
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
  } catch (err) {
    console.warn(err);
    return {};
  }
};

export const createTheme = (
  brandColors?: BrandColors,
  customTokens?: Partial<DesignTokensOverride>,
): ThemeOptions => {
  // Odyssey 1.x does not export their theme, but we can recreate it
  const theme = createOdysseyMuiTheme({ odysseyTokens: { ...Tokens, ...customTokens } });

  // TODO: OKTA-667943 - Update palette generation for OD 1.x larger hue range
  if (brandColors?.primaryColor) {
    const p = generatePalette(brandColors.primaryColor);
    set(theme, 'palette.primary.lighter', p.lighter);
    set(theme, 'palette.primary.light', p.light);
    set(theme, 'palette.primary.main', p.main);
    set(theme, 'palette.primary.dark', p.dark);
    set(theme, 'palette.primary.contrastText', p.contrastText);
  }
  if (customTokens) {
    if (customTokens.PalettePrimaryMain) {
      const p = generatePalette(customTokens.PalettePrimaryMain);
      set(theme, 'palette.primary.lighter', customTokens.PalettePrimaryLighter ?? p.lighter);
      set(theme, 'palette.primary.light', customTokens.PalettePrimaryLight ?? p.light);
      set(theme, 'palette.primary.main', customTokens.PalettePrimaryMain ?? p.main);
      set(theme, 'palette.primary.dark', customTokens.PalettePrimaryDark ?? p.dark);
      set(theme, 'palette.primary.contrastText', p.contrastText);
    }
    if (customTokens.PaletteDangerMain) {
      const p = generatePalette(customTokens.PaletteDangerMain);
      set(theme, 'palette.error.lighter', customTokens.PaletteDangerLighter ?? p.lighter);
      set(theme, 'palette.error.light', customTokens.PaletteDangerLight ?? p.light);
      set(theme, 'palette.error.main', customTokens.PaletteDangerMain ?? p.main);
      set(theme, 'palette.error.dark', customTokens.PaletteDangerDark ?? p.dark);
      set(theme, 'palette.error.contrastText', p.contrastText);
    }
    if (customTokens.PaletteWarningMain) {
      const p = generatePalette(customTokens.PaletteWarningMain);
      set(theme, 'palette.warning.lighter', customTokens.PaletteWarningLighter ?? p.lighter);
      set(theme, 'palette.warning.light', customTokens.PaletteWarningLight ?? p.light);
      set(theme, 'palette.warning.main', customTokens.PaletteWarningMain ?? p.main);
      set(theme, 'palette.warning.dark', customTokens.PaletteWarningDark ?? p.dark);
      set(theme, 'palette.warning.contrastText', p.contrastText);
    }
    if (customTokens.PaletteSuccessMain) {
      const p = generatePalette(customTokens.PaletteSuccessMain);
      set(theme, 'palette.success.lighter', customTokens.PaletteSuccessLighter ?? p.lighter);
      set(theme, 'palette.success.light', customTokens.PaletteSuccessLight ?? p.light);
      set(theme, 'palette.success.main', customTokens.PaletteSuccessMain ?? p.main);
      set(theme, 'palette.success.dark', customTokens.PaletteSuccessDark ?? p.dark);
      set(theme, 'palette.success.contrastText', p.contrastText);
    }
  }

  // Merge default Odyssey 1.x theme with component overrides
  const themeOverride = mergeThemes(theme, {
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
          root: {
            width: '100%',
          },
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
            // OKTA-657762 - remove this when odyssey fix is done
            textTransform: 'none',
          }),
        },
      },
      // ruleset with :focus-visible pseudo-selector break entire ruleset in
      // ie11 because its not supported. re-define the :hover rule separately
      // again so the ruleset is applied in ie11
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: 'rgba(29, 29, 33, 0.1)',
              borderColor: 'transparent',
            },
          },
        },
      },

      MuiLink: {
        styleOverrides: {
          root: ({ ownerState, theme: t }) => ({
            color: t.palette.primary.main,
            textDecoration: ownerState?.component === 'a' ? 'underline' : 'inherit',

            '&:hover': {
              color: t.palette.primary.dark,
            },
          }),
        },
      },
    },
  });

  return themeOverride;
};
