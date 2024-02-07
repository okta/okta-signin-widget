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

import { Link, Typography } from '@mui/material';
import {
  attributesToProps,
  DOMNode,
  domToReact,
  Element,
  HTMLReactParserOptions,
} from 'html-react-parser';
import { h } from 'preact';

export const getLinkReplacerFn = (
  parserOptions: HTMLReactParserOptions,
  variant?: 'monochrome',
): HTMLReactParserOptions['replace'] => (
  // eslint-disable-next-line react/display-name
  (node: DOMNode) => {
    const {
      attribs = {},
      children = [],
      name = undefined,
      type = undefined,
    } = (node instanceof Element) ? node : {};
    if (node instanceof Element && type === 'tag' && name === 'a') {
      const props = attributesToProps(attribs);
      return (
        <Link
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
          variant={variant}
        >
          {domToReact(children, parserOptions)}
        </Link>
      );
    }
    return undefined;
  }
);

export const getHeadingReplacerFn = (
  parserOptions: HTMLReactParserOptions,
  targetElement: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
  newElementLevel: 1 | 2 | 3 | 4 | 5 | 6,
  visualLevel : 1 | 2 | 3 | 4 | 5 | 6,
): HTMLReactParserOptions['replace'] => (
  // eslint-disable-next-line react/display-name
  (node: DOMNode) => {
    const {
      attribs = {},
      children = [],
      name = undefined,
      type = undefined,
    } = (node instanceof Element) ? node : {};
    if (node instanceof Element && type === 'tag' && name === targetElement) {
      const props = attributesToProps(attribs);
      return (
        <Typography
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
          component={`h${newElementLevel}`}
          variant={`h${visualLevel}`}
        >
          {domToReact(children, parserOptions)}
        </Typography>
      );
    }
    return undefined;
  }
);

export const wrapInTranslateNo = (string: string): string => `<span translate="no">${string}</span>`;
