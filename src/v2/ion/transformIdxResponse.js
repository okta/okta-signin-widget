/*!
 * Copyright (c) 2020, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { _ } from '@okta/courage';
import responseTransformer from './responseTransformer';
import uiSchemaTransformer from './uiSchemaTransformer';
import i18nTransformer from './i18nTransformer';

// Transforms an IDX response to an ION response
export default function transformIdxResponse(settings, curResponse, lastResponse) {
  const ionResponse = _.compose(
    i18nTransformer,
    uiSchemaTransformer.bind({}, settings),
    responseTransformer.bind({}, settings),
  )(curResponse, lastResponse);
  return ionResponse;
}
