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

import { CSSInterpolation } from '@mui/material';
import { ThemeOptions } from '@okta/odyssey-react-mui';
import { merge } from 'lodash';

import { cssInterpolate } from './cssInterpolate';

type Props = Record<string, unknown>;
type StyleOverrideFunction = (override: Props) => CSSInterpolation;
type StyleOverride = string | CSSInterpolation | StyleOverrideFunction;

/**
 * Resolve style override
 */
const resolve = (override: StyleOverride, arg: Props): CSSInterpolation => {
  if (!override) {
    return {};
  }
  if (typeof override === 'function') {
    return override(arg);
  }
  if (typeof override === 'string') {
    return cssInterpolate(override);
  }
  if (typeof override !== 'object') {
    // console.warn(`unrecognized type ${typeof override}`);
  }
  return override;
};

/**
 * Merge themes
 */
export const mergeThemes = (
  first: ThemeOptions,
  ...rest: Array<ThemeOptions>
): ThemeOptions => (
  rest.reduce((prev, theme) => (
    !theme.components
      ? merge(prev, theme)
      : [...Object.entries(theme.components)]
        .reduce((t, [component, config]) => ({
          ...t,
          components: {
            ...t.components,
            [component]: {
              // @ts-expect-error cannot index Components by string
              ...t.components[component],
              styleOverrides: {
                // @ts-expect-error cannot index Components by string
                ...t.components[component].styleOverrides,
                root: (options: Record<string, unknown>) => ({
                  // @ts-expect-error FIXME CSSInterpolation may not be CSSObject
                  ...resolve(prev.components?.[component]?.styleOverrides?.root, options),
                  // @ts-expect-error FIXME CSSInterpolation may not be CSSObject
                  ...resolve(config.styleOverrides?.root, options),
                }),
                icon: (options: Record<string, unknown>) => ({
                  // @ts-expect-error FIXME CSSInterpolation may not be CSSObject
                  ...resolve(prev.components?.[component]?.styleOverrides?.icon, options),
                  // @ts-expect-error FIXME CSSInterpolation may not be CSSObject
                  ...resolve(config.styleOverrides?.icon, options),
                }),
                input: (options: Record<string, unknown>) => ({
                  // @ts-expect-error FIXME CSSInterpolation may not be CSSObject
                  ...resolve(prev.components?.[component]?.styleOverrides?.input, options),
                  // @ts-expect-error FIXME CSSInterpolation may not be CSSObject
                  ...resolve(config.styleOverrides?.input, options),
                }),
                adornedEnd: (options: Record<string, unknown>) => ({
                  // @ts-expect-error FIXME CSSInterpolation may not be CSSObject
                  ...resolve(prev.components?.[component]?.styleOverrides?.adornedEnd, options),
                  // @ts-expect-error FIXME CSSInterpolation may not be CSSObject
                  ...resolve(config.styleOverrides?.adornedEnd, options),
                }),
                adornedStart: (options: Record<string, unknown>) => ({
                  // @ts-expect-error FIXME CSSInterpolation may not be CSSObject
                  ...resolve(prev.components?.[component]?.styleOverrides?.adornedStart, options),
                  // @ts-expect-error FIXME CSSInterpolation may not be CSSObject
                  ...resolve(config.styleOverrides?.adornedStart, options),
                }),
                label: (options: Record<string, unknown>) => ({
                  // @ts-expect-error FIXME CSSInterpolation may not be CSSObject
                  ...resolve(prev.components?.[component]?.styleOverrides?.label, options),
                  // @ts-expect-error FIXME CSSInterpolation may not be CSSObject
                  ...resolve(config.styleOverrides?.label, options),
                }),
                button: (options: Record<string, unknown>) => ({
                  // @ts-expect-error FIXME CSSInterpolation may not be CSSObject
                  ...resolve(prev.components?.[component]?.styleOverrides?.button, options),
                  // @ts-expect-error FIXME CSSInterpolation may not be CSSObject
                  ...resolve(config.styleOverrides?.button, options),
                }),
                select: (options: Record<string, unknown>) => ({
                  // @ts-expect-error FIXME CSSInterpolation may not be CSSObject
                  ...resolve(prev.components?.[component]?.styleOverrides?.select, options),
                  // @ts-expect-error FIXME CSSInterpolation may not be CSSObject
                  ...resolve(config.styleOverrides?.select, options),
                }),
              },
            },
          },
        }), prev)
  ), first)
);
