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

import {
  BackgroundColor, Color, CssColor, Theme,
} from '@adobe/leonardo-contrast-colors';
import * as Tokens from '@okta/odyssey-design-tokens';
import { createOdysseyMuiTheme, DesignTokensOverride, ThemeOptions } from '@okta/odyssey-react-mui';

import Logger from '../../../util/Logger';
import { BrandColors } from '../types';
import { isLtrField } from '.';
import { mergeThemes } from './mergeThemes';

const WHITE_HEX = '#ffffff';
// Odyssey-defined contrast ratios for their WCAG-friendly palettes
const ODYSSEY_RATIOS = [1.1, 1.31, 1.61, 2.22, 3.32, 4.52, 4.93, 8.72, 11.73, 14.94];

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
    Logger.warn(err);
    return null;
  }
};

export const createThemeAndTokens = (
  brandColors?: BrandColors,
  customTokens?: Partial<DesignTokensOverride>,
): { themeOverride: ThemeOptions, tokensOverride: DesignTokensOverride } => {
  const tokensOverride = { ...customTokens };

  if (brandColors?.primaryColor) {
    const p = generatePalette(brandColors.primaryColor);
    tokensOverride.PalettePrimaryLighter ??= p?.CustomHue50;
    tokensOverride.PalettePrimaryHighlight ??= p?.CustomHue100;
    tokensOverride.PalettePrimaryLight ??= p?.CustomHue300;
    tokensOverride.PalettePrimaryMain ??= p?.CustomHue500;
    tokensOverride.FocusOutlineColorPrimary ??= p?.CustomHue500;
    tokensOverride.BorderColorPrimaryControl ??= p?.CustomHue500;
    tokensOverride.TypographyColorAction ??= p?.CustomHue600;
    tokensOverride.PalettePrimaryText ??= p?.CustomHue600;
    tokensOverride.BorderColorPrimaryDark ??= p?.CustomHue700;
    tokensOverride.PalettePrimaryDark ??= p?.CustomHue700;
    tokensOverride.PalettePrimaryDarker ??= p?.CustomHue800;
    tokensOverride.PalettePrimaryHeading ??= p?.CustomHue900;
  }

  const mergedTokens = { ...Tokens, ...tokensOverride };

  // Odyssey 1.x does not export their theme, but we can recreate it
  const baseOdysseyTheme = createOdysseyMuiTheme({
    odysseyTokens: mergedTokens,
  });

  // Merge default Odyssey 1.x theme with component overrides
  const themeOverride = mergeThemes(baseOdysseyTheme, {
    components: {
      MuiAccordion: {
        styleOverrides: {
          root: {
            border: 0,
          },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            paddingInline: mergedTokens.Spacing0,
            paddingBlock: mergedTokens.Spacing0,
            paddingBlockStart: mergedTokens.Spacing4,
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            display: 'inline-flex',
            minHeight: 0,
            paddingInline: mergedTokens.Spacing0,
            paddingBlock: mergedTokens.Spacing0,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'transparent',
            },
            '&:focus': {
              backgroundColor: 'transparent',
            },
            '& .MuiAccordionSummary-content': {
              margin: mergedTokens.Spacing0,
              '& .MuiTypography-root': {
                textDecoration: 'underline',
                fontWeight: mergedTokens.TypographyWeightBody,
                color: mergedTokens.TypographyColorAction,
                '&:hover': {
                  color: mergedTokens.BorderColorPrimaryDark,
                },
              },
            },
            '& .MuiAccordionSummary-expandIconWrapper': {
              display: 'none',
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            gap: mergedTokens.Spacing0,
          },
          icon: {
            paddingInlineEnd: mergedTokens.Spacing5,
            flexShrink: 0,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: ({ ownerState }) => ({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            whiteSpace: 'normal',
            // Odyssey CircularProgress does not allow color change but SIW needs a white spinner
            // when rendering it as the startIcon for primary buttons
            ...(ownerState.variant === 'primary' && {
              '&:disabled': {
                color: mergedTokens.PalettePrimaryLight,
                backgroundColor: mergedTokens.PalettePrimaryHighlight,
                '& .MuiCircularProgress-root': {
                  color: mergedTokens.PalettePrimaryLight,
                },
              },
            }),
            // Fix for IE11 - don't shrink icon if the button text is multiline
            ...(ownerState.startIcon && {
              '& .MuiButton-startIcon': {
                flexShrink: 0,
              },
            }),
          }),
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            // Odyssey uses gap for spacing between Checkbox and label which is not IE11-friendly
            marginInlineEnd: mergedTokens.Spacing2,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            lineHeight: 'normal',
          },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            // Odyssey uses gap for spacing between Checkbox and label which is not IE11-friendly
            gap: mergedTokens.Spacing0,
          },
          label: {
            // Fixes text overflow in IE11
            width: '100%',
            // Forces Odyssey Checkbox hint text to be grey even during error state
            '& .MuiFormHelperText-root.Mui-error': {
              color: mergedTokens.TypographyColorSubordinate,
            },
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            display: 'block',
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: ({ ownerState }) => ({
            width: '100%',
            // Odyssey sets flex: "1" but that results in the following IE11 flexbug
            // https://github.com/philipwalton/flexbugs?tab=readme-ov-file#flexbug-7
            flex: 'auto',
            ...(ownerState.name && isLtrField(ownerState.name) && {
              direction: 'ltr',
            }),
          }),
          input: {
            '::-ms-reveal': {
              display: 'none',
            },
          },
          adornedEnd: ({ ownerState }) => ({
            // Odyssey does not support a focus indicator around toggle icon button
            '& .MuiIconButton-root:focus-visible': {
              borderRadius: mergedTokens.BorderRadiusMain,
              outlineColor: mergedTokens.FocusOutlineColorPrimary,
              outlineStyle: mergedTokens.FocusOutlineStyle,
              outlineWidth: mergedTokens.FocusOutlineWidthTight,
            },
            // Explicitly switch to physical properties for password toggle icon since
            // IE11 stylis plugin cannot handle nested logical properties
            ...(ownerState.name && isLtrField(ownerState.name) && {
              '& .MuiInputAdornment-root': {
                marginRight: mergedTokens.Spacing2,
              },
            }),
          }),
          adornedStart: ({ ownerState }) => ({
            // Explicitly switch to physical properties for telephone code
            ...(ownerState.type === 'tel' && {
              '& .MuiInputAdornment-root': {
                marginInlineStart: mergedTokens.Spacing0,
                marginLeft: mergedTokens.Spacing2,
              },
            }),
          }),
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: ({ ownerState }) => ({
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            ...(ownerState.formControl && {
              // Odyssey sets position: "initial" which is not supported in IE11
              // "initial" uses browser default which is "static"
              position: 'static',
            }),
          }),
        },
      },
      MuiLink: {
        styleOverrides: {
          button: {
            verticalAlign: 'baseline',
          },
        },
      },
      MuiNativeSelect: {
        styleOverrides: {
          select: {
            paddingRight: `${mergedTokens.Spacing7} !important`,
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            // Odyssey uses gap for spacing between Checkbox/Radio and label
            marginInlineEnd: mergedTokens.Spacing2,
            '&.Mui-checked': {
              // Odyssey position: absolute breaks radio checked circle alignment
              '&::before': {
                position: 'relative',
                backgroundColor: mergedTokens.PalettePrimaryMain,
              },
            },
          },
        },
      },
      MuiScopedCssBaseline: {
        styleOverrides: {
          root: {
            figure: {},
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            '&[data-se="o-form-head"]': {
              outline: 'none',
            },
          },
        },
      },
    },
  });

  return { themeOverride, tokensOverride };
};
