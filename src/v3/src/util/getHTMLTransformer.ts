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

import { convertNodeToElement, Options } from 'react-html-parser';

export const getHTMLTransformer = (
  currentNodeName: string,
  newNodeName: string,
  attributes?: Record<string, unknown>,
): Options['transform'] => {
  const transform: Options['transform'] = (node, index) => {
    if (node.type === 'tag' && node.name === currentNodeName) {
      // eslint-disable-next-line no-param-reassign
      node.name = newNodeName;
      if (typeof attributes !== 'undefined') {
        // eslint-disable-next-line no-param-reassign
        node.attribs = attributes;
      }
      return convertNodeToElement(node, index, transform!);
    }
    return undefined;
  };

  return transform;
};
