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

// Leonardo doesn't have TS support in stable version alpha.13 so types are defined in leonardo.d.ts
import {
  BackgroundColor, Color, CssColor, Theme,
} from '@adobe/leonardo-contrast-colors';
import * as Tokens from '@okta/odyssey-design-tokens';
import { createOdysseyMuiTheme, DesignTokensOverride, ThemeOptions } from '@okta/odyssey-react-mui';

import { BrandColors } from '../types';
import { mergeThemes } from './mergeThemes';

const WHITE_HEX = '#ffffff';
// Odyssey-defined contrast ratios for their WCAG-friendly palettes
const ODYSSEY_RATIOS = [1.1, 1.31, 1.61, 2.22, 3.32, 4.5, 4.95, 8.72, 11.73, 14.94];

interface OdysseyPalette {
  CustomHue50: string,
  CustomHue100: string,
  CustomHue200: string,
  CustomHue300: string,
  CustomHue400: string,
  CustomHue500: string,
  CustomHue600: string,
  CustomHue700: string,
  CustomHue800: string,
  CustomHue900: string
}

/**
 * Generates a palette using @adobe/leonardo-contrast-colors based on the "main"
 * (f.k.a. "base") value. Leonardo generates 10 different hues that adhere to Odyssey's
 * contrast ratios
 *
 * Example:
 * PalettePrimaryMain -> CustomHue500
 * PalettePrimaryLighter -> CustomHue50
 * PalettePrimaryLight -> CustomHue300
 * PalettePrimaryDark -> CustomHue700
 * PalettePrimaryDarker -> CustomHue900
 *
 * @param main Main color used to generate a palette
 */
export const generatePalette = (main: string): OdysseyPalette | null => {
  try {
    const primaryColor = new Color({
      name: 'Custom Hue',
      // Leonardo will throw "Invalid Color Key" error if string is not of type CssColor
      colorKeys: [main as CssColor],
      ratios: ODYSSEY_RATIOS,
    });
    // SIW always has a white background color
    const backgroundColor = new BackgroundColor({
      name: 'Background Color',
      colorKeys: [WHITE_HEX],
      ratios: [],
    });
    const leonardoTheme = new Theme({
      colors: [primaryColor],
      backgroundColor,
      lightness: 100,
    }).contrastColorPairs;

    // Remap Leonardo theme to use Odyssey color stops from 50-900
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
    };
    return theme;
  } catch (err) {
    console.warn(err);
    return null;
  }
};

export const createThemeAndTokens = (
  brandColors?: BrandColors,
  customTokens?: Partial<DesignTokensOverride>,
): { themeOverride: ThemeOptions, tokensOverride: DesignTokensOverride } => {
  const tokensOverride = { ...customTokens };

  // We want to prioritize design tokens over brand colors for primary palette
  if (customTokens?.PalettePrimaryMain) {
    const p = generatePalette(customTokens.PalettePrimaryMain);
    if (p) {
      tokensOverride.PalettePrimaryLighter ??= p.CustomHue50;
      tokensOverride.PalettePrimaryHighlight ??= p.CustomHue100;
      tokensOverride.PalettePrimaryLight ??= p.CustomHue300;
      tokensOverride.PalettePrimaryMain = p.CustomHue500;
      tokensOverride.FocusOutlineColorPrimary ??= p.CustomHue500;
      tokensOverride.BorderColorPrimaryControl ??= p.CustomHue500;
      tokensOverride.TypographyColorAction ??= p.CustomHue600;
      tokensOverride.PalettePrimaryText ??= p.CustomHue600;
      tokensOverride.BorderColorPrimaryDark ??= p.CustomHue700;
      tokensOverride.PalettePrimaryDark ??= p.CustomHue700;
      tokensOverride.PalettePrimaryDarker ??= p.CustomHue800;
      tokensOverride.PalettePrimaryHeading ??= p.CustomHue900;
    }
  } else if (brandColors?.primaryColor) {
    const p = generatePalette(brandColors.primaryColor);
    if (p) {
      tokensOverride.PalettePrimaryLighter ??= p.CustomHue50;
      tokensOverride.PalettePrimaryHighlight ??= p.CustomHue100;
      tokensOverride.PalettePrimaryLight ??= p.CustomHue300;
      tokensOverride.PalettePrimaryMain = p.CustomHue500;
      tokensOverride.FocusOutlineColorPrimary ??= p.CustomHue500;
      tokensOverride.BorderColorPrimaryControl ??= p.CustomHue500;
      tokensOverride.TypographyColorAction ??= p.CustomHue600;
      tokensOverride.PalettePrimaryText ??= p.CustomHue600;
      tokensOverride.BorderColorPrimaryDark ??= p.CustomHue700;
      tokensOverride.PalettePrimaryDark ??= p.CustomHue700;
      tokensOverride.PalettePrimaryDarker ??= p.CustomHue800;
      tokensOverride.PalettePrimaryHeading ??= p.CustomHue900;
    }
  }
  if (customTokens?.PaletteDangerMain) {
    const p = generatePalette(customTokens.PaletteDangerMain);
    if (p) {
      tokensOverride.PaletteDangerLighter ??= p.CustomHue50;
      tokensOverride.PaletteDangerHighlight ??= p.CustomHue100;
      tokensOverride.PaletteDangerLight ??= p.CustomHue300;
      tokensOverride.BorderColorDangerLight ??= p.CustomHue300;
      tokensOverride.PaletteDangerMain = p.CustomHue500;
      tokensOverride.FocusOutlineColorDanger ??= p.CustomHue500;
      tokensOverride.BorderColorDangerControl ??= p.CustomHue500;
      tokensOverride.PaletteDangerText ??= p.CustomHue600;
      tokensOverride.TypographyColorDanger ??= p.CustomHue600;
      tokensOverride.BorderColorDangerDark ??= p.CustomHue700;
      tokensOverride.PaletteDangerDark ??= p.CustomHue700;
      tokensOverride.PaletteDangerDarker ??= p.CustomHue800;
      tokensOverride.PaletteDangerHeading ??= p.CustomHue900;
    }
  }
  if (customTokens?.PaletteWarningMain) {
    const p = generatePalette(customTokens.PaletteWarningMain);
    if (p) {
      tokensOverride.PaletteWarningLighter ??= p.CustomHue50;
      tokensOverride.PaletteWarningHighlight ??= p.CustomHue100;
      tokensOverride.PaletteWarningLight ??= p.CustomHue300;
      tokensOverride.PaletteWarningMain = p.CustomHue500;
      tokensOverride.PaletteWarningText ??= p.CustomHue600;
      tokensOverride.TypographyColorWarning ??= p.CustomHue600;
      tokensOverride.PaletteWarningDark ??= p.CustomHue700;
      tokensOverride.PaletteWarningDarker ??= p.CustomHue800;
      tokensOverride.PaletteWarningHeading ??= p.CustomHue900;
    }
  }
  if (customTokens?.PaletteSuccessMain) {
    const p = generatePalette(customTokens.PaletteSuccessMain);
    if (p) {
      tokensOverride.PaletteSuccessLighter ??= p.CustomHue50;
      tokensOverride.PaletteSuccessHighlight ??= p.CustomHue100;
      tokensOverride.PaletteSuccessLight ??= p.CustomHue300;
      tokensOverride.PaletteSuccessMain = p.CustomHue500;
      tokensOverride.PaletteSuccessText ??= p.CustomHue600;
      tokensOverride.TypographyColorSuccess ??= p.CustomHue600;
      tokensOverride.PaletteSuccessDark ??= p.CustomHue700;
      tokensOverride.PaletteSuccessDarker ??= p.CustomHue800;
      tokensOverride.PaletteSuccessHeading ??= p.CustomHue900;
    }
  }

  // Odyssey 1.x does not export their theme, but we can recreate it
  const baseOdysseyTheme = createOdysseyMuiTheme({
    odysseyTokens: { ...Tokens, ...tokensOverride },
  });

  // Merge default Odyssey 1.x theme with component overrides
  const themeOverride = mergeThemes(baseOdysseyTheme, {
    components: {
      MuiAlert: {
        styleOverrides: {
          root: {
            gap: 0,
          },
          icon: {
            paddingInlineEnd: Tokens.Spacing5,
            flexShrink: 0,
          },
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
      MuiLink: {
        styleOverrides: {
          root: ({ ownerState }) => ({
            textDecoration: ownerState?.component === 'a' ? 'underline' : 'inherit',
          }),
        },
      },
    },
  });

  return { themeOverride, tokensOverride };
};
