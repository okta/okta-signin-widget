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
import chroma from 'chroma-js';

import { createThemeAndTokens, generatePalette } from './theme';

const WHITE_HEX = '#ffffff';
// Odyssey-defined contrast ratios for their WCAG-friendly palettes
const ODYSSEY_RATIOS = [1.1, 1.31, 1.61, 2.22, 3.32, 4.5, 4.95, 8.72, 11.73, 14.94];

describe('theme utilities', () => {
  describe('generatePalette', () => {
    it('generates a palette with Odyssey contrast ratios', () => {
      const palette = generatePalette('#546BE7');
      expect(palette).toBeDefined();
      expect(Object.keys(palette!).length).toBe(10);
      const contrastRatios = Object.values(palette!).map((hue) => chroma.contrast(hue, WHITE_HEX));
      // Precision of 0.5 maps to 0.2 as an allowed deviation to account for differences between
      // chroma.contrast() and Leonardo's calculations
      contrastRatios.forEach((ratio, i) => expect(ratio).toBeCloseTo(ODYSSEY_RATIOS[i], 0.5));
    });

    it('returns null for invalid colors', () => {
      // suppress warnings from when chroma-js throws
      jest.spyOn(console, 'warn').mockImplementation(() => { });

      expect(generatePalette('#12345')).toBeNull();
      expect(generatePalette('#ff00gg')).toBeNull();
      expect(generatePalette('')).toBeNull();

      jest.restoreAllMocks();
    });
  });

  describe('createThemeAndTokens', () => {
    // Explicitly construct OD 1.x palette because odyssey-react-mui palette's 'dark' is
    // different than Tokens.PalettePrimaryDark
    const defaultOdyPrimaryPalette = {
      main: Tokens.PalettePrimaryMain,
      light: Tokens.PalettePrimaryLight,
      lighter: Tokens.PalettePrimaryLighter,
      dark: Tokens.HueBlue900,
      contrastText: Tokens.TypographyColorInverse,
    };

    it('should use brandColors.primaryColor to set PalettePrimary.* tokens', () => {
      const primaryColor = '#7950f2';
      const palette = generatePalette(primaryColor);
      const { tokensOverride: tokens } = createThemeAndTokens({ primaryColor });
      // Pick a subset of the overridden primary-related design tokens to assert on
      expect(tokens.PalettePrimaryMain).toEqual(palette?.CustomHue500);
      expect(tokens.PalettePrimaryDark).toEqual(palette?.CustomHue700);
      expect(tokens.TypographyColorAction).toEqual(palette?.CustomHue600);
    });

    it('should ignore brandColors if undefined and use default Odyssey theme', () => {
      const { themeOverride: theme } = createThemeAndTokens();
      expect(theme.palette?.primary).toEqual(defaultOdyPrimaryPalette);
    });

    it('should ignore brandColors.primaryColor if invalid', () => {
      // suppress warnings from when @adobe/leonardo-contrast-color throws
      jest.spyOn(console, 'warn').mockImplementation(() => { });
      const primaryColor = '#invalid';
      const { themeOverride: theme } = createThemeAndTokens({ primaryColor });
      expect(theme.palette?.primary).toEqual(defaultOdyPrimaryPalette);
    });

    it('should use PalettePrimaryMain to set PalettePrimary.* tokens', () => {
      const PalettePrimaryMain = '#7950f2';
      const palette = generatePalette(PalettePrimaryMain);
      const { tokensOverride: tokens } = createThemeAndTokens(undefined, { PalettePrimaryMain });
      // Pick a subset of the overridden primary-related design tokens to assert on
      expect(tokens.PalettePrimaryMain).toEqual(palette?.CustomHue500);
      expect(tokens.PalettePrimaryDark).toEqual(palette?.CustomHue700);
      expect(tokens.TypographyColorAction).toEqual(palette?.CustomHue600);
    });

    it('should use PaletteDangerMain to set PaletteDanger.* tokens', () => {
      const PaletteDangerMain = '#7950f2';
      const palette = generatePalette(PaletteDangerMain);
      const { tokensOverride: tokens } = createThemeAndTokens(undefined, { PaletteDangerMain });
      // Pick a subset of the overridden danger-related design tokens to assert on
      expect(tokens.PaletteDangerMain).toEqual(palette?.CustomHue500);
      expect(tokens.PaletteDangerDark).toEqual(palette?.CustomHue700);
      expect(tokens.BorderColorDangerControl).toEqual(palette?.CustomHue500);
    });

    it('should use PaletteWarningMain to set PaletteWarning.* tokens', () => {
      const PaletteWarningMain = '#7950f2';
      const palette = generatePalette(PaletteWarningMain);
      const { tokensOverride: tokens } = createThemeAndTokens(undefined, { PaletteWarningMain });
      // Pick a subset of the overridden warning-related design tokens to assert on
      expect(tokens.PaletteWarningMain).toEqual(palette?.CustomHue500);
      expect(tokens.PaletteWarningDark).toEqual(palette?.CustomHue700);
      expect(tokens.TypographyColorWarning).toEqual(palette?.CustomHue600);
    });

    it('should use PaletteSuccessMain to set PaletteSuccess.* tokens', () => {
      const PaletteSuccessMain = '#7950f2';
      const palette = generatePalette(PaletteSuccessMain);
      const { tokensOverride: tokens } = createThemeAndTokens(undefined, { PaletteSuccessMain });
      // Pick a subset of the overridden success-related design tokens to assert on
      expect(tokens.PaletteSuccessMain).toEqual(palette?.CustomHue500);
      expect(tokens.PaletteSuccessDark).toEqual(palette?.CustomHue700);
      expect(tokens.PaletteSuccessText).toEqual(palette?.CustomHue600);
    });

    it('should override brandColors.primaryColor with Tokens.PalettePrimaryMain', () => {
      // #FF3D3D is a bright red, #7950f2 is a bright purple
      const { tokensOverride: tokens } = createThemeAndTokens({ primaryColor: '#FF3D3D' }, { PalettePrimaryMain: '#7950f2' });
      // PalettePrimaryMain won't be exactly #7950f2 because Leonardo does not map directly to
      // customer's color, but #8059f3 is very similar to #7950f2
      expect(tokens.PalettePrimaryMain).toEqual('#8059f3');
    });

    it('should override non-palette Odyssey default theme values with custom tokens', () => {
      const customTokens = {
        BorderRadiusMain: '1rem',
        TypographyColorHeading: '#77216F',
      };
      const { themeOverride: theme } = createThemeAndTokens(undefined, customTokens);
      expect(theme.mixins?.borderRadius).toEqual(customTokens.BorderRadiusMain);
      // @ts-expect-error Odyssey theme sets heading colors by default
      expect(theme.typography?.h1.color).toEqual(customTokens.TypographyColorHeading);
    });
  });
});
