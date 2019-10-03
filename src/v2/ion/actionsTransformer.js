/*!
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { _ } from 'okta';
import httpClient from './httpClient';

const convertActionToRequestFunction = action => {
  const reqFn = extraData => {
    const request = action(extraData);
    return httpClient.fetchRequest(request.url, request.method, request.data);
  };
  if (action.refresh) {
    reqFn.refresh = action.refresh;
  }

  return reqFn;
};

/**
 *
 * @param {AuthnResult} resp transformed authn v2 response
 * @returns {AuthnResult} result with transformed actions
 */
const transformActions = transformedResp => {
  if (!_.isObject(transformedResp)) {
    return null;
  }

  // Assuming we have only functions in 1st level objects
  return _.mapObject(transformedResp, firstLevelObject => {
    return _.mapObject(firstLevelObject, val => {
      if (_.isFunction(val)) {
        return convertActionToRequestFunction(val);
      } else {
        return val;
      }
    });
  });
};

module.exports = transformActions;
