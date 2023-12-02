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

// @ts-ignore
import { Theme, Color, BackgroundColor } from '@adobe/leonardo-contrast-colors';
import * as Tokens from '@okta/odyssey-design-tokens';
import { createOdysseyMuiTheme, DesignTokensOverride, ThemeOptions } from '@okta/odyssey-react-mui';
import { set as _set } from 'lodash';

import { BrandColors } from '../types';
import { mergeThemes } from './mergeThemes';

const WHITE_HEX = '#ffffff';
const ODYSSEY_RATIOS = [1.1, 1.31, 1.61, 2.22, 3.32, 4.5, 4.95, 8.72, 11.73, 14.94];

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
 * PalettePrimaryDark -> HueBlue900
 *
 * @param main Main color (Hue 500)
 */
export const generatePalette = (main: string): Theme => {
  let primaryColor = new Color({
    name: 'Custom Hue',
    colorKeys: [main],
    ratios: ODYSSEY_RATIOS
  });
  const backgroundColor = new BackgroundColor({
    name: 'Background Color',
    colorKeys: [WHITE_HEX],
    ratios: []
  });
  const leonardoTheme = new Theme({ colors: [primaryColor], backgroundColor, lightness: 100 })._contrastColorPairs;
  // Remap leonardo theme to use Odyssey color stops from 50-900
  const theme = {
    CustomHue50: leonardoTheme.CustomHue100,
    CustomHue100: leonardoTheme.CustomHue200,
    CustomHue200: leonardoTheme.CustomHue300,
    CustomHue300: leonardoTheme.CustomHue400,
    CustomHue400: leonardoTheme.CustomHue500,
    CustomHue500: leonardoTheme.CustomHue600,
    CustomHue600: leonardoTheme.CustomHue700,
    CustomHue700: leonardoTheme.CustomHue800,
    CustomHue800: leonardoTheme.CustomHue900,
    CustomHue900: leonardoTheme.CustomHue1000,
  }
  return theme;
};

export const createTheme = (
  brandColors?: BrandColors,
  customTokens?: Partial<DesignTokensOverride>,
): ThemeOptions => {
  const tokensOverride = { ...customTokens }
  const themePaletteOverride = {}

  if (brandColors?.primaryColor) {
    const p = generatePalette(brandColors.primaryColor);
    tokensOverride.PalettePrimaryLighter ??= p.CustomHue50;
    tokensOverride.PalettePrimaryHighlight ??= p.CustomHue100;
    tokensOverride.PalettePrimaryLight ??= p.CustomHue300;
    tokensOverride.PalettePrimaryMain ??= p.CustomHue500;
    tokensOverride.FocusOutlineColorPrimary ??= p.CustomHue500;
    tokensOverride.BorderColorPrimaryControl ??= p.CustomHue500;
    tokensOverride.TypographyColorAction ??= p.CustomHue600;
    tokensOverride.PalettePrimaryText ??= p.CustomHue600;
    tokensOverride.BorderColorPrimaryDark ??= p.CustomHue700;
    tokensOverride.PalettePrimaryDark ??= p.CustomHue700;
    tokensOverride.PalettePrimaryDarker ??= p.CustomHue800;
    tokensOverride.PalettePrimaryHeading ??= p.CustomHue900;
    set(themePaletteOverride, 'palette.primary.lighter', p.CustomHue50);
    set(themePaletteOverride, 'palette.primary.light', p.CustomHue300);
    set(themePaletteOverride, 'palette.primary.main', p.CustomHue500);
    set(themePaletteOverride, 'palette.primary.dark', p.CustomHue900);
  }
  if (customTokens) {
    if (customTokens.PalettePrimaryMain) {
      const p = generatePalette(customTokens.PalettePrimaryMain);
      tokensOverride.PalettePrimaryLighter ??= p.CustomHue50;
      tokensOverride.PalettePrimaryHighlight ??= p.CustomHue100;
      tokensOverride.PalettePrimaryLight ??= p.CustomHue300;
      tokensOverride.PalettePrimaryMain ??= p.CustomHue500;
      tokensOverride.FocusOutlineColorPrimary ??= p.CustomHue500;
      tokensOverride.BorderColorPrimaryControl ??= p.CustomHue500;
      tokensOverride.TypographyColorAction ??= p.CustomHue600;
      tokensOverride.PalettePrimaryText ??= p.CustomHue600;
      tokensOverride.BorderColorPrimaryDark ??= p.CustomHue700;
      tokensOverride.PalettePrimaryDark ??= p.CustomHue700;
      tokensOverride.PalettePrimaryDarker ??= p.CustomHue800;
      tokensOverride.PalettePrimaryHeading ??= p.CustomHue900;
      set(themePaletteOverride, 'palette.primary.lighter', p.CustomHue50);
      set(themePaletteOverride, 'palette.primary.light', p.CustomHue300);
      set(themePaletteOverride, 'palette.primary.main', p.CustomHue500);
      set(themePaletteOverride, 'palette.primary.dark', p.CustomHue900);
    }
    if (customTokens.PaletteDangerMain) {
      const p = generatePalette(customTokens.PaletteDangerMain);
      tokensOverride.PaletteDangerLighter ??= p.CustomHue50;
      tokensOverride.PaletteDangerHighlight ??= p.CustomHue100;
      tokensOverride.PaletteDangerLight ??= p.CustomHue300;
      tokensOverride.BorderColorDangerLight ??= p.CustomHue300;
      tokensOverride.PaletteDangerMain ??= p.CustomHue500;
      tokensOverride.FocusOutlineColorDanger ??= p.CustomHue500;
      tokensOverride.BorderColorDangerControl ??= p.CustomHue500;
      tokensOverride.PaletteDangerText ??= p.CustomHue600;
      tokensOverride.TypographyColorDanger ??= p.CustomHue600;
      tokensOverride.BorderColorDangerDark ??= p.CustomHue700;
      tokensOverride.PaletteDangerDark ??= p.CustomHue700;
      tokensOverride.PaletteDangerDarker ??= p.CustomHue800;
      tokensOverride.PaletteDangerHeading ??= p.CustomHue900;
      set(themePaletteOverride, 'palette.danger.lighter', p.CustomHue50);
      set(themePaletteOverride, 'palette.danger.light', p.CustomHue300);
      set(themePaletteOverride, 'palette.danger.main', p.CustomHue500);
      set(themePaletteOverride, 'palette.danger.dark', p.CustomHue900);
    }
    if (customTokens.PaletteWarningMain) {
      const p = generatePalette(customTokens.PaletteWarningMain);
      tokensOverride.PaletteWarningLighter ??= p.CustomHue50;
      tokensOverride.PaletteWarningHighlight ??= p.CustomHue100;
      tokensOverride.PaletteWarningLight ??= p.CustomHue300;
      tokensOverride.PaletteWarningMain ??= p.CustomHue500;
      tokensOverride.PaletteWarningText ??= p.CustomHue600;
      tokensOverride.TypographyColorWarning ??= p.CustomHue600;
      tokensOverride.PaletteWarningDark ??= p.CustomHue700;
      tokensOverride.PaletteWarningDarker ??= p.CustomHue800;
      tokensOverride.PaletteWarningHeading ??= p.CustomHue900;
      set(themePaletteOverride, 'palette.warning.lighter', p.CustomHue50);
      set(themePaletteOverride, 'palette.warning.light', p.CustomHue300);
      set(themePaletteOverride, 'palette.warning.main', p.CustomHue500);
      set(themePaletteOverride, 'palette.warning.dark', p.CustomHue900);
      set(themePaletteOverride, 'palette.warning.contrastText', WHITE_HEX);
    }
    if (customTokens.PaletteSuccessMain) {
      const p = generatePalette(customTokens.PaletteSuccessMain);
      tokensOverride.PaletteSuccessLighter ??= p.CustomHue50;
      tokensOverride.PaletteSuccessHighlight ??= p.CustomHue100;
      tokensOverride.PaletteSuccessLight ??= p.CustomHue300;
      tokensOverride.PaletteSuccessMain ??= p.CustomHue500;
      tokensOverride.PaletteSuccessText ??= p.CustomHue600;
      tokensOverride.TypographyColorSuccess ??= p.CustomHue600;
      tokensOverride.PaletteSuccessDark ??= p.CustomHue700;
      tokensOverride.PaletteSuccessDarker ??= p.CustomHue800;
      tokensOverride.PaletteSuccessHeading ??= p.CustomHue900;
      set(themePaletteOverride, 'palette.success.lighter', p.CustomHue50);
      set(themePaletteOverride, 'palette.success.light', p.CustomHue300);
      set(themePaletteOverride, 'palette.success.main', p.CustomHue500);
      set(themePaletteOverride, 'palette.success.dark', p.CustomHue900);
    }
  }

  // Odyssey 1.x does not export their theme, but we can recreate it
  const baseOdysseyTheme = createOdysseyMuiTheme({ odysseyTokens: { ...Tokens, ...tokensOverride } });

  // Merge default Odyssey 1.x theme with component overrides
  const themeOverride = mergeThemes(baseOdysseyTheme, themePaletteOverride, {
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

  console.log(themeOverride);

  return themeOverride;
};
