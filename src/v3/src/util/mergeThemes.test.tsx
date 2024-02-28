/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { CSSObject, TextField } from '@mui/material';
import * as Tokens from '@okta/odyssey-design-tokens';
import { createOdysseyMuiTheme, OdysseyThemeProvider } from '@okta/odyssey-react-mui';
import { render } from '@testing-library/preact';

import { mergeThemes } from './mergeThemes';

test('mergeThemes()', () => {
  const odysseyTheme = createOdysseyMuiTheme({ odysseyTokens: Tokens });

  const merged = mergeThemes(
    odysseyTheme,
    {
      components: {
        MuiInputLabel: {
          styleOverrides: {
            root: 'white-space: nowrap; background-color: #456; justify-content: flex-start;',
          },
        },
      },
    },
    {
      components: {
        MuiInputLabel: {
          styleOverrides: {
            root: () => ({
              whiteSpace: 'break-spaces',
              justifyContent: 'revert',
              color: 'blue',
            } as CSSObject),
          },
        },
      },
    },
    {
      components: {
        MuiInputLabel: {
          styleOverrides: {
            root: {
              whiteSpace: 'pre-wrap',
              backgroundColor: '#abc',
              display: 'flex',
            },
          },
        },
      },
    },
  );
  const root = merged.components?.MuiInputLabel?.styleOverrides?.root;

  expect(typeof root).toBe('function');

  // Odyssey 1.x default MuiInputLabel styles not present in style overrides
  const odysseyThemeDefaultStyles = {
    '& > .MuiTypography-root': {
      lineHeight: 'unset',
    },
    overflow: 'unset',
  };

  const customStyles = {
    display: 'flex',
    justifyContent: 'revert',
    whiteSpace: 'pre-wrap',
    backgroundColor: '#abc',
    color: 'blue',
  };

  const mergedStyles = { ...odysseyThemeDefaultStyles, ...customStyles };

  expect(typeof root).toBe('function');

  // @ts-expect-error root is function
  const actual = root({
    ownerState: {},
    theme: odysseyTheme,
  });
  expect(actual).toEqual(mergedStyles);

  const { getByText } = render(
    <OdysseyThemeProvider themeOverride={merged}>
      <TextField label="Label" />
    </OdysseyThemeProvider>,
  );
  const el = getByText('Label', { selector: 'label' });
  expect(el).toHaveStyle(customStyles);
});
