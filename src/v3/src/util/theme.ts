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
import { cloneDeep, set as _set, isUndefined, omit } from 'lodash';
import { buttonClasses } from "@mui/material/Button";

import { Brand } from '../types';
import { DESIGN_TOKENS, DesignTokensType } from './designTokens';
import { mergeThemes } from './mergeThemes';
import { ThemeOptions } from '@mui/material';

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

/**
 * Determine whether to use BLACK (#1d1d21) or WHITE (#ffffff) based on a color.
 * If WHITE vs color has a contrast ratio <4.5:1 this will return BLACK.
 * Contrast ratios are symmetrical using the WCAG 2.x algorithm
 *
 * @param color color to compare against black/white
 */
const getInverseTextColor = (color: string): string => (
  chroma.contrast(color, WHITE) > 4.5 ? WHITE : BLACK
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
function set<T extends object, V>(obj: T, path: string | string[], val: V) {
  return isUndefined(val) ? null : _set(obj, path, val);
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
    } : {
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
    }
};

export const createTheme = (
  brand?: Brand,
  customTokens?: Partial<DesignTokensType>,
): Theme => {
  const defaultTokens = DESIGN_TOKENS;
  const mergedTokens: DesignTokensType = { ...defaultTokens, ...customTokens };
  const theme = odysseyTheme;
  theme.palette.text.primary = BLACK;
  if (brand?.primaryColor) {
    const palettePrimary = generatePalette(brand.primaryColor);
    const { lighter, light, main, dark } = palettePrimary;
    set(theme, 'palette.primary.lighter', lighter);
    set(theme, 'palette.primary.light', light);
    set(theme, 'palette.primary.main', main);
    set(theme, 'palette.primary.dark', dark);
  }
  if (customTokens) {
    if (customTokens.PalettePrimaryMain) {
      const { lighter, light, main, dark } = generatePalette(customTokens.PalettePrimaryMain);
      set(theme, 'palette.primary.lighter', customTokens.PalettePrimaryLighter ?? lighter);
      set(theme, 'palette.primary.light', customTokens.PalettePrimaryLight ?? light);
      set(theme, 'palette.primary.main', customTokens.PalettePrimaryMain ?? main);
      set(theme, 'palette.primary.dark', customTokens.PalettePrimaryDark ?? dark);
    }
    if (customTokens.PaletteDangerMain) {
      const { lighter, light, main, dark } = generatePalette(customTokens.PaletteDangerMain);
      set(theme, 'palette.error.lighter', customTokens.PaletteDangerLighter ?? lighter);
      set(theme, 'palette.error.light', customTokens.PaletteDangerLight ?? light);
      set(theme, 'palette.error.main', customTokens.PaletteDangerMain ?? main);
      set(theme, 'palette.error.dark', customTokens.PaletteDangerDark ?? dark);
    }
    if (customTokens.PaletteWarningMain) {
      const { lighter, light, main, dark } = generatePalette(customTokens.PaletteWarningMain);
      set(theme, 'palette.warning.lighter', customTokens.PaletteWarningLighter ?? lighter);
      set(theme, 'palette.warning.light', customTokens.PaletteWarningLight ?? light);
      set(theme, 'palette.warning.main', customTokens.PaletteWarningMain ?? main);
      set(theme, 'palette.warning.dark', customTokens.PaletteWarningDark ?? dark);
    }
    if (customTokens.PaletteSuccessMain) {
      const { lighter, light, main, dark } = generatePalette(customTokens.PaletteSuccessMain);
      set(theme, 'palette.success.lighter', customTokens.PaletteSuccessLighter ?? lighter);
      set(theme, 'palette.success.light', customTokens.PaletteSuccessLight ?? light);
      set(theme, 'palette.success.main', customTokens.PaletteSuccessMain ?? main);
      set(theme, 'palette.success.dark', customTokens.PaletteSuccessDark ?? dark);
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
      MuiInputLabel: {
        styleOverrides: {
          root: {
            wordBreak: 'break-word',
            whiteSpace: 'normal',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          variant: "primary",
          disableElevation: true,
        },
        styleOverrides: {
          root: ({ ownerState }) => {
            console.log(ownerState.variant);
            const rv = {
              minWidth: "unset",
              paddingBlock: mergedTokens.Spacing3,
              paddingInline: mergedTokens.Spacing4,
              display: "inline-flex",
              position: "relative",
              marginBlock: "0",
              marginInline: "0",
              transitionProperty:
                "color, background-color, border-color, box-shadow",
              transitionDuration: "100ms",
              transitionTimingFunction: "linear",
              borderWidth: mergedTokens.BorderWidthMain,
              borderStyle: mergedTokens.BorderStyleMain,
              borderRadius: mergedTokens.BorderRadiusMain,
              borderColor: "transparent",
              fontSize: mergedTokens.TypographySizeBody,
              fontWeight: mergedTokens.TypographyWeightBodyBold,
              fontFamily: mergedTokens.TypographyFamilyButton,
              lineHeight: mergedTokens.TypographyLineHeightUi,
              whiteSpace: "nowrap",

              [`.${buttonClasses.root} + &`]: {
                marginInlineStart: mergedTokens.Spacing2,
              },

              "&:focus-visible": {
                boxShadow: `0 0 0 2px ${mergedTokens.HueNeutralWhite}, 0 0 0 4px ${mergedTokens.PalettePrimaryMain}`,
                outline: "2px solid transparent",
                outlineOffset: "1px",
              },

              "&:disabled": {
                pointerEvents: "none",
              },

              [`.${buttonClasses.startIcon}, .${buttonClasses.endIcon}`]: {
                "& > *:nth-of-type(1)": {
                  fontSize: `${mergedTokens.TypographyLineHeightUi}em`,
                },
              },

              ...(ownerState.variant === "primary" && {
                color: mergedTokens.HueNeutralWhite,
                backgroundColor: mergedTokens.PalettePrimaryMain,

                "&:hover": {
                  backgroundColor: mergedTokens.PalettePrimaryDark,
                },

                "&:active": {
                  backgroundColor: mergedTokens.PalettePrimaryDarker,
                },

                "&:disabled": {
                  color: mergedTokens.PalettePrimaryLight,
                  backgroundColor: mergedTokens.HueBlue100,
                },
              }),

              ...(ownerState.variant === "secondary" && {
                backgroundColor: mergedTokens.HueBlue100,
                color: mergedTokens.PalettePrimaryDark,

                "&:hover": {
                  backgroundColor: mergedTokens.HueBlue200,
                  color: mergedTokens.HueBlue800,
                },

                "&:active": {
                  backgroundColor: mergedTokens.PalettePrimaryLight,
                  color: mergedTokens.HueBlue800,
                },

                "&:disabled": {
                  backgroundColor: mergedTokens.HueNeutral100,
                  color: mergedTokens.TypographyColorDisabled,
                },
              }),

              ...(ownerState.variant === "tertiary" && {
                backgroundColor: mergedTokens.HueNeutral100,
                color: mergedTokens.HueNeutral700,

                "&:hover": {
                  backgroundColor: mergedTokens.HueNeutral200,
                  color: mergedTokens.HueNeutral800,
                },

                "&:active": {
                  backgroundColor: mergedTokens.HueNeutral300,
                  color: mergedTokens.HueNeutral800,
                },

                "&:disabled": {
                  backgroundColor: mergedTokens.HueNeutral100,
                  color: mergedTokens.TypographyColorDisabled,
                },
              }),

              ...(ownerState.variant === "danger" && {
                backgroundColor: mergedTokens.PaletteDangerMain,
                color: mergedTokens.HueNeutralWhite,

                "&:hover": {
                  backgroundColor: mergedTokens.PaletteDangerDark,
                },

                "&:focus-visible": {
                  boxShadow: `0 0 0 2px ${mergedTokens.HueNeutralWhite}, 0 0 0 4px ${mergedTokens.PaletteDangerMain}`,
                },

                "&:active": {
                  backgroundColor: mergedTokens.PaletteDangerDarker,
                },

                "&:disabled": {
                  color: mergedTokens.PaletteDangerLight,
                  backgroundColor: mergedTokens.HueRed100,
                },
              }),
              ...(ownerState.variant === "floating" && {
                backgroundColor: "transparent",
                color: mergedTokens.TypographyColorBody,

                "&:hover": {
                  backgroundColor: mergedTokens.HueNeutral100,
                },

                "&:active": {
                  backgroundColor: mergedTokens.HueNeutral200,
                },

                "&:disabled": {
                  backgroundColor: "transparent",
                  color: mergedTokens.TypographyColorDisabled,
                },
              }),
              ...(ownerState.size === "small" && {
                paddingBlock: mergedTokens.Spacing2,
                paddingInline: mergedTokens.Spacing3,
                fontSize: mergedTokens.TypographySizeBody,
              }),
              ...(ownerState.size === "large" && {
                paddingBlock: mergedTokens.Spacing4,
                paddingInline: mergedTokens.Spacing4,
              }),
              ...(ownerState.fullWidth === true && {
                display: "block",
                width: "100%",
                marginBlock: "0",
                marginInline: "0",

                "&:not(:last-child)": {
                  marginBlockEnd: mergedTokens.Spacing4,
                },
              }),
              ...(ownerState.children === "" && {
                minWidth: "auto",
                padding: mergedTokens.Spacing3,

                [`.${buttonClasses.endIcon}, .${buttonClasses.startIcon}`]: {
                  margin: "0",
                },

                ...(ownerState.size === "small" && {
                  padding: mergedTokens.Spacing2,
                }),
              }),
            }
            console.log(rv['&:hover']);
            return rv;
          },

          endIcon: ({ ownerState }) => ({
            display: "inline-flex",
            margin: 0,
            marginInlineStart: mergedTokens.Spacing2,

            ...(ownerState.children === undefined && {
              marginInlineStart: 0,
            }),
          }),

          startIcon: ({ ownerState }) => ({
            display: "inline-flex",
            margin: 0,
            marginInlineEnd: mergedTokens.Spacing2,

            ...(ownerState.children === undefined && {
              marginInlineEnd: 0,
            }),
          }),
        },
      },
    }
  }) as Theme;
};
