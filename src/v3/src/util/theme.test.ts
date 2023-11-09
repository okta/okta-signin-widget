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

import { odysseyTheme } from '@okta/odyssey-react-mui-legacy';
import chroma from 'chroma-js';
import { get } from 'lodash';

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
    it('should use brandColors.primaryColor to set theme.palette.primary.*', () => {
      const primaryColor = '#7950f2';
      const palette = generatePalette(primaryColor);
      const theme = createTheme({ primaryColor });
      expect(theme.palette?.primary).toEqual(palette);
    });
    it('should ignore brandColors if undefined', () => {
      const theme = createTheme();
      expect(theme.palette?.primary).toEqual(odysseyTheme.palette.primary);
    });
    it('should ignore brandColors.primaryColor if invalid', () => {
      // suppress warnings from when chroma-js throws
      jest.spyOn(console, 'warn').mockImplementation(() => { });
      const primaryColor = '#invalid';
      const theme = createTheme({ primaryColor });
      expect(theme.palette?.primary).toEqual(odysseyTheme.palette.primary);
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

    describe('should apply design tokens -> theme properties', () => {
      test.each([
        ['BorderRadiusMain', 'mixins.borderRadius', 'TEST_0'],
        ['BorderStyleMain', 'mixins.borderStyle', 'TEST_1'],
        ['BorderWidthMain', 'mixins.borderWidth', 'TEST_2'],
        ['TypographyColorDisabled', 'palette.text.disabled', 'TEST_3'],
        ['TypographyColorBody', 'palette.text.primary', 'TEST_4'],
        ['ShadowScale0', 'shadows[1]', 'TEST_5'],
        ['ShadowScale1', 'shadows[2]', 'TEST_6'],
        ['TypographyFamilyBody', 'typography.body1.fontFamily', 'TEST_7'],
        ['TypographySizeBody', 'typography.body1.fontSize', 'TEST_8'],
        ['TypographyStyleNormal', 'typography.body1.fontStyle', 'TEST_9'],
        ['TypographyLineHeightBody', 'typography.body1.lineHeight', 'TEST_10'],
        ['TypographyFamilyButton', 'typography.button.fontFamily', 'TEST_11'],
        ['TypographyColorSubordinate', 'typography.caption.color', 'TEST_12'],
        ['TypographyFamilyBody', 'typography.caption.fontFamily', 'TEST_13'],
        ['TypographySizeSubordinate', 'typography.caption.fontSize', 'TEST_14'],
        ['TypographyFamilyBody', 'typography.fontFamily', 'TEST_15'],
        ['TypographyWeightBodyBold', 'typography.fontWeightBold', 'TEST_16'],
        ['TypographyWeightBody', 'typography.fontWeightRegular', 'TEST_17'],
        ['TypographyColorHeading', 'typography.h1.color', 'TEST_18'],
        ['TypographyFamilyHeading', 'typography.h1.fontFamily', 'TEST_19'],
        ['TypographySizeHeading1', 'typography.h1.fontSize', 'TEST_20'],
        ['TypographyWeightHeading', 'typography.h1.fontWeight', 'TEST_21'],
        ['TypographyLineHeightHeading1', 'typography.h1.lineHeight', 'TEST_22'],
        ['TypographyColorHeading', 'typography.h2.color', 'TEST_23'],
        ['TypographyFamilyHeading', 'typography.h2.fontFamily', 'TEST_24'],
        ['TypographySizeHeading2', 'typography.h2.fontSize', 'TEST_25'],
        ['TypographyWeightHeading', 'typography.h2.fontWeight', 'TEST_26'],
        ['TypographyLineHeightHeading2', 'typography.h2.lineHeight', 'TEST_27'],
        ['TypographyColorHeading', 'typography.h3.color', 'TEST_28'],
        ['TypographyFamilyHeading', 'typography.h3.fontFamily', 'TEST_29'],
        ['TypographySizeHeading3', 'typography.h3.fontSize', 'TEST_30'],
        ['TypographyWeightHeading', 'typography.h3.fontWeight', 'TEST_31'],
        ['TypographyLineHeightHeading3', 'typography.h3.lineHeight', 'TEST_32'],
        ['TypographyColorHeading', 'typography.h4.color', 'TEST_33'],
        ['TypographyFamilyHeading', 'typography.h4.fontFamily', 'TEST_34'],
        ['TypographySizeHeading4', 'typography.h4.fontSize', 'TEST_35'],
        ['TypographyWeightHeading', 'typography.h4.fontWeight', 'TEST_36'],
        ['TypographyLineHeightHeading4', 'typography.h4.lineHeight', 'TEST_37'],
        ['TypographyColorHeading', 'typography.h5.color', 'TEST_38'],
        ['TypographyFamilyHeading', 'typography.h5.fontFamily', 'TEST_39'],
        ['TypographySizeHeading5', 'typography.h5.fontSize', 'TEST_40'],
        ['TypographyWeightHeading', 'typography.h5.fontWeight', 'TEST_41'],
        ['TypographyLineHeightHeading5', 'typography.h5.lineHeight', 'TEST_42'],
        ['TypographyColorHeading', 'typography.h6.color', 'TEST_43'],
        ['TypographyFamilyHeading', 'typography.h6.fontFamily', 'TEST_44'],
        ['TypographySizeHeading6', 'typography.h6.fontSize', 'TEST_45'],
        ['TypographyWeightHeading', 'typography.h6.fontWeight', 'TEST_46'],
        ['TypographyLineHeightHeading6', 'typography.h6.lineHeight', 'TEST_47'],
        ['TypographyLineHeightOverline', 'typography.overline.lineHeight', 'TEST_48'],
        ['TypographyFamilyBody', 'typography.subtitle1.fontFamily', 'TEST_49'],
        ['TypographyFamilyBody', 'typography.subtitle2.fontFamily', 'TEST_50'],
      ])('%s -> %s', (name, path, value) => {
        const theme = createTheme(undefined, { [name]: value });
        expect(get(theme, path)).toEqual(value);
      });
    });

    it('should use Spacing0..Spacing9 tokens to set the theme.spacing function', () => {
      const theme = createTheme(undefined, {
        Spacing0: '0ex',
        Spacing1: '2ex',
        Spacing2: '4ex',
        Spacing3: '6ex',
        Spacing4: '8ex',
        Spacing5: '10ex',
        Spacing6: '12ex',
        Spacing7: '14ex',
        Spacing8: '16ex',
        Spacing9: '18ex',
      });
      expect(typeof theme.spacing).toBe('function');

      if (typeof theme.spacing !== 'function') {
        throw new Error('theme.spacing should be a function');
      }
      expect(theme.spacing(0)).toBe('0ex');
      expect(theme.spacing(1)).toBe('2ex');
      expect(theme.spacing(2)).toBe('4ex');
      expect(theme.spacing(3)).toBe('6ex');
      expect(theme.spacing(4)).toBe('8ex');
      expect(theme.spacing(5)).toBe('10ex');
      expect(theme.spacing(6)).toBe('12ex');
      expect(theme.spacing(7)).toBe('14ex');
      expect(theme.spacing(8)).toBe('16ex');
      expect(theme.spacing(9)).toBe('18ex');
    });

    test('theme.tokens.PalettePrimaryMain overrides brandColors.primaryColor', () => {
      const theme = createTheme({ primaryColor: '#aaa' }, { PalettePrimaryMain: '#bbb' });
      // @ts-expect-error Property PaletteColorOptions is a union
      expect(theme.palette?.primary?.main).toEqual('#bbb');
    });

    test('tokens should override generated palette colors', () => {
      const tokens = {
        PalettePrimaryLight: '#77216F',
        PalettePrimaryMain: '#5E2750',
        PalettePrimaryDark: '#2C001E',
      };
      const palette = generatePalette('#5E2750');
      const theme = createTheme(undefined, tokens);
      expect(theme.palette?.primary).toEqual({
        lighter: palette.lighter, // generated
        light: tokens.PalettePrimaryLight, // provided
        main: tokens.PalettePrimaryMain, // provided
        dark: tokens.PalettePrimaryDark, // provided
        contrastText: palette.contrastText, // generated
      });
    });
  });
});
