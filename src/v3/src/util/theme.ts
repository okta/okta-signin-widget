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
import { Theme } from '@mui/material/styles/createTheme';
import { odysseyTheme } from '@okta/odyssey-react-mui';
import chroma from 'chroma-js';
import { cloneDeep, merge } from 'lodash';

import { BrandColors, LanguageDirection } from '../types';

type DerivedTheme = {
  primaryColor: string;
  primaryColorLight: string;
  primaryColorLightest: string;
  primaryColorDark: string;
  textColor: string;
  inverseTextColor: string;
};

const getInverseTextColor = (primaryColor: string): string => {
  const contrastRatio = chroma.contrast(primaryColor, '#ffffff');

  if (contrastRatio > 4.5) {
    return '#ffffff';
  }
  return '#1d1d21';
};

export const deriveThemeFromBrand = (brand: BrandColors): DerivedTheme | null => {
  try {
    const isLightPrimaryColor = chroma(brand.primaryColor).get('hsl.l') > 0.24;

    if (isLightPrimaryColor) {
      let primaryColorLight = chroma(brand.primaryColor)
        .set('hsl.h', '+11')
        .set('hsl.s', '-0.18')
        .set('hsl.l', '+0.31');
      // lightness of primaryColorLight should be clamped at max of 0.9
      if (primaryColorLight.get('hsl.l') > 0.9) {
        primaryColorLight = primaryColorLight.set('hsl.l', 0.9);
      }

      return {
        primaryColor: brand.primaryColor,
        textColor: '#1d1d21',
        primaryColorLight: primaryColorLight.hex(),
        primaryColorLightest: chroma(brand.primaryColor)
          .set('hsl.h', '+9')
          .set('hsl.s', '+0.18')
          .set('hsl.l', 0.97)
          .hex(),
        primaryColorDark: chroma(brand.primaryColor)
          .set('hsl.h', '+3')
          .set('hsl.s', '+0.18')
          .set('hsl.l', '-0.24')
          .hex(),
        inverseTextColor: getInverseTextColor(brand.primaryColor),
      };
    }

    return {
      primaryColor: brand.primaryColor,
      textColor: '#1d1d21',
      primaryColorLight: chroma(brand.primaryColor)
        .set('hsl.l', '+0.62')
        .hex(),
      primaryColorLightest: chroma(brand.primaryColor)
        .set('hsl.h', '+9')
        .set('hsl.s', '+0.18')
        .set('hsl.l', 0.97)
        .hex(),
      primaryColorDark: chroma(brand.primaryColor)
        .set('hsl.l', '+0.31')
        .hex(),
      inverseTextColor: getInverseTextColor(brand.primaryColor),
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Invalid theme color in configuration', brand);

    return null;
  }
};

export const mapMuiThemeFromBrand = (
  brand: BrandColors | undefined,
  languageDirection: LanguageDirection,
  muiThemeOverrides?: ThemeOptions,
): Theme => {
  // TODO: OKTA-517723 temporary override until odyssey-react-mui theme borderRadius value is fixed
  odysseyTheme.shape.borderRadius = 4;

  const odysseyThemeCopy = cloneDeep(odysseyTheme);
  odysseyTheme.direction = languageDirection;

  if (brand) {
    const derivedTheme = deriveThemeFromBrand(brand);

    if (derivedTheme) {
      odysseyThemeCopy.palette.primary = {
        main: derivedTheme.primaryColor,
        light: derivedTheme.primaryColorLight,
        lighter: derivedTheme.primaryColorLightest,
        dark: derivedTheme.primaryColorDark,
        contrastText: derivedTheme.inverseTextColor,
      };

      odysseyThemeCopy.palette.text.primary = derivedTheme.textColor;
    }
  }

  return merge(odysseyThemeCopy, muiThemeOverrides);
};
