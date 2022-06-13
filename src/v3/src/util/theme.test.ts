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

import chroma from 'chroma-js';

import { deriveThemeFromBrand } from './theme';

describe('theme utilities', () => {
  describe('deriveTheme generates', () => {
    it('for light primary color', () => {
      const derived = deriveThemeFromBrand({
        primaryColor: '#cc0000',
      });

      expect(derived).toBeDefined();
      expect(derived?.primaryColor).toBe('#cc0000');
      expect(derived?.primaryColorLight).toBe('#f28f78');
      expect(derived?.primaryColorLightest).toBe('#fff1f0');
      expect(derived?.primaryColorDark).toBe('#640000');
      expect(derived?.inverseTextColor).toBe('#ffffff');
    });

    it('for light primary color with poor contrast against white', () => {
      const derived = deriveThemeFromBrand({
        primaryColor: '#6666ff',
      });

      expect(derived).toBeDefined();
      expect(derived?.inverseTextColor).toBe('#1d1d21');
    });

    it('for light primary color with clamped primaryColorLight', () => {
      const colorWithLightness60 = chroma.hsl(100, 1, 0.6);
      const derived = deriveThemeFromBrand({
        primaryColor: colorWithLightness60.hex(),
      });

      expect(derived).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const derivedPrimaryColorLight = chroma(derived!.primaryColorLight);

      expect(derivedPrimaryColorLight.get('hsl.l')).toBeCloseTo(0.90, 5);
    });

    it('generates a derived theme for dark primary color', () => {
      const derived = deriveThemeFromBrand({
        primaryColor: '#170f5f',
      });

      expect(derived).toBeDefined();
      expect(derived?.primaryColor).toBe('#170f5f');
      expect(derived?.primaryColorLight).toBe('#bdb7f4');
      expect(derived?.primaryColorLightest).toBe('#f4f0fe');
      expect(derived?.primaryColorDark).toBe('#402ede');
      expect(derived?.inverseTextColor).toBe('#ffffff');
    });

    it('returns null for invalid colors', () => {
      // suppress warnings from when chroma-js throws
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      expect(deriveThemeFromBrand({ primaryColor: '#12345' })).toBeNull();
      expect(deriveThemeFromBrand({ primaryColor: '#ff00gg' })).toBeNull();
      expect(deriveThemeFromBrand({ primaryColor: '' })).toBeNull();

      jest.restoreAllMocks();
    });
  });
});
