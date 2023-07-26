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

import dompurify from 'dompurify';
import HtmlReactParser, { HTMLReactParserOptions } from 'html-react-parser';
import * as preact from 'preact';

import { getLinkReplacerFn } from '../util';

export const useHtmlContentParser = (
  content: string | undefined,
  options?: HTMLReactParserOptions,
): string | preact.JSX.Element | preact.JSX.Element[] | undefined => {
  if (typeof content === 'undefined') {
    return undefined;
  }

  const parserOptions: HTMLReactParserOptions = {
    ...options,
    library: preact,
  };

  if (typeof parserOptions.replace === 'undefined') {
    // default link replacer function
    parserOptions.replace = getLinkReplacerFn(parserOptions);
  }

  const sanitizedContent = dompurify.sanitize(content, { ADD_ATTR: ['target'] });
  return HtmlReactParser(sanitizedContent, parserOptions);
};
