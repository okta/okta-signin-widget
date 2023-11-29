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

import { createTheme, generatePalette } from './theme';

describe('theme utilities', () => {
  describe('generatePalette', () => {
    it('for light primary color', () => {
      const palette = generatePalette('#cc0000');
      expect(palette).toBeDefined();
      expect(palette?.main).toBe('#cc0000');
      expect(palette?.light).toBe('#f28f78');
      expect(palette?.lighter).toBe('#fff1f0');
      expect(palette?.dark).toBe('#640000');
      expect(palette?.contrastText).toBe('#ffffff');
    });

    it('for light primary color with poor contrast against white', () => {
      const palette = generatePalette('#6666ff');
      expect(palette).toBeDefined();
      expect(palette?.contrastText).toBe('#1d1d21');
    });

    it('for light primary color with clamped primaryColorLight', () => {
      const colorWithLightness60 = chroma.hsl(100, 1, 0.6);
      const palette = generatePalette(colorWithLightness60.hex());

      expect(palette).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const derivedPrimaryColorLight = chroma(palette.light!);
      expect(derivedPrimaryColorLight.get('hsl.l')).toBeCloseTo(0.90, 2);
    });

    it('generates a derived theme for dark primary color', () => {
      const palette = generatePalette('#170f5f');
      expect(palette).toBeDefined();
      expect(palette?.main).toBe('#170f5f');
      expect(palette?.light).toBe('#bdb7f4');
      expect(palette?.lighter).toBe('#f4f0fe');
      expect(palette?.dark).toBe('#402ede');
      expect(palette?.contrastText).toBe('#ffffff');
    });

    it('returns null for invalid colors', () => {
      // suppress warnings from when chroma-js throws
      jest.spyOn(console, 'warn').mockImplementation(() => { });

      expect(generatePalette('#12345')).toEqual({});
      expect(generatePalette('#ff00gg')).toEqual({});
      expect(generatePalette('')).toEqual({});

      jest.restoreAllMocks();
    });
  });

  describe('createTheme', () => {
    // Explicitly construct OD 1.x palette because odyssey-react-mui palette's 'dark' is
    // different than Tokens.PalettePrimaryDark
    const defaultOdyPrimaryPalette = {
      main: Tokens.PalettePrimaryMain,
      light: Tokens.PalettePrimaryLight,
      lighter: Tokens.PalettePrimaryLighter,
      dark: Tokens.HueBlue900,
      contrastText: Tokens.TypographyColorInverse,
    };

    it('should use brandColors.primaryColor to set theme.palette.primary.*', () => {
      const primaryColor = '#7950f2';
      const palette = generatePalette(primaryColor);
      const theme = createTheme({ primaryColor });
      expect(theme.palette?.primary).toEqual(palette);
    });

    it('should ignore brandColors if undefined and use default Odyssey theme', () => {
      const theme = createTheme();
      expect(theme.palette?.primary).toEqual(defaultOdyPrimaryPalette);
    });

    it('should ignore brandColors.primaryColor if invalid', () => {
      // suppress warnings from when chroma-js throws
      jest.spyOn(console, 'warn').mockImplementation(() => { });
      const primaryColor = '#invalid';
      const theme = createTheme({ primaryColor });
      expect(theme.palette?.primary).toEqual(defaultOdyPrimaryPalette);
    });

    it('should use PalettePrimaryMain to set theme.palette.primary.*', () => {
      const PalettePrimaryMain = '#7950f2';
      const palette = generatePalette(PalettePrimaryMain);
      const theme = createTheme(undefined, { PalettePrimaryMain });
      expect(theme.palette?.primary).toEqual(palette);
    });

    it('should use PaletteDangerMain to set theme.palette.error.*', () => {
      const PaletteDangerMain = '#e72500';
      const palette = generatePalette(PaletteDangerMain);
      const theme = createTheme(undefined, { PaletteDangerMain });
      expect(theme.palette?.error).toEqual(palette);
    });

    it('should use PaletteWarningMain to set theme.palette.warning.*', () => {
      const PaletteWarningMain = '#a16c03';
      const palette = generatePalette(PaletteWarningMain);
      const theme = createTheme(undefined, { PaletteWarningMain });
      expect(theme.palette?.warning).toEqual(palette);
    });

    it('should use PaletteSuccessMain to set theme.palette.success.*', () => {
      const PaletteSuccessMain = '#16884a';
      const palette = generatePalette(PaletteSuccessMain);
      const theme = createTheme(undefined, { PaletteSuccessMain });
      expect(theme.palette?.success).toEqual(palette);
    });

    it('should override brandColors.primaryColor with Tokens.PalettePrimaryMain', () => {
      const theme = createTheme({ primaryColor: '#aaa' }, { PalettePrimaryMain: '#bbb' });
      // @ts-expect-error Property PaletteColorOptions is a union
      expect(theme.palette?.primary?.main).toEqual('#bbb');
    });

    it('should override generated palette colors with custom tokens', () => {
      const customTokens = {
        PalettePrimaryLight: '#77216F',
        PalettePrimaryMain: '#5E2750',
        PalettePrimaryDark: '#2C001E',
      };
      const palette = generatePalette('#5E2750');
      const theme = createTheme(undefined, customTokens);
      expect(theme.palette?.primary).toEqual({
        lighter: palette.lighter, // generated
        light: customTokens.PalettePrimaryLight, // provided
        main: customTokens.PalettePrimaryMain, // provided
        dark: customTokens.PalettePrimaryDark, // provided
        contrastText: palette.contrastText, // generated
      });
    });

    it('should override non-palette Odyssey default theme values with custom tokens', () => {
      const customTokens = {
        BorderRadiusMain: '1rem',
        TypographyColorHeading: '#77216F',
      };
      const theme = createTheme(undefined, customTokens);
      expect(theme.mixins?.borderRadius).toEqual(customTokens.BorderRadiusMain);
      // @ts-expect-error Odyssey theme sets heading colors by default
      expect(theme.typography?.h1.color).toEqual(customTokens.TypographyColorHeading);
    });
  });
});
