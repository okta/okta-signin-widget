/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */
import { UnknownFn } from './types';

export function htmlString(obj: Record<string, string>): string {
  return JSON.stringify(obj, null, 2).replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;');
}

export function toQueryString(obj: Record<string, string>): string {
  const str = [];
  if (obj !== null) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) &&
      
          obj[key] !== undefined &&
          obj[key] !== null) {
        str.push(key + '=' + encodeURIComponent(obj[key]));
      }
    }
  }
  if (str.length) {
    return '?' + str.join('&');
  } else {
    return '';
  }
}


export function makeClickHandler(fn: UnknownFn): UnknownFn {
  return function(event: Event) {
    event && event.preventDefault(); // prevent navigation / page reload
    return fn();
  };
}
