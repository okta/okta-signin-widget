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

import { Link } from '@okta/odyssey-react-mui';
import HtmlReactParser, {
  attributesToProps, DOMNode, domToReact, Element, HTMLReactParserOptions,
} from 'html-react-parser';
import { h } from 'preact';

export const useHtmlContentParser = (
  content: string | undefined,
  options?: HTMLReactParserOptions,
): string | h.JSX.Element | h.JSX.Element[] | undefined => {
  if (typeof content === 'undefined') {
    return undefined;
  }

  const parserOptions: HTMLReactParserOptions = {
    ...options,
    // eslint-disable-next-line global-require
    library: require('preact'),
  };
  // default replacer function
  const replace = (node: DOMNode) => {
    if (node instanceof Element && node.type === 'tag' && node.name === 'a') {
      const props = attributesToProps(node.attribs);
      // eslint-disable-next-line react/jsx-props-no-spreading
      return <Link {...props}>{domToReact(node.children, parserOptions)}</Link>;
    }
    return undefined;
  };
  if (typeof parserOptions.replace === 'undefined') {
    parserOptions.replace = replace;
  }

  return HtmlReactParser(content, parserOptions);
};
