/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { Model } from '@okta/courage';
import { mergeHook } from 'util/Hooks';
import { HookDefinition, HooksOptions } from 'types';

export default class Hooks extends Model {

  mergeHook(formName: string, hookToMerge: HookDefinition): void {
    const hooks = this.get('hooks') || {};
    mergeHook(hooks, formName, hookToMerge);
    this.set('hooks', hooks);
  }

  getHook(formName: string): HookDefinition {
    const hooks: HooksOptions = this.get('hooks') || {};
    let result = undefined;   // original implementation returned undefined by default

    // always include hooks bound globally
    const globalHooks = hooks['*'];
    if (globalHooks) {
      result = {...globalHooks};
      // bind the formName as the first argument of the event handler fn
      // specific handlers get passed no argument
      if (result.before) {
        result.before = result.before.map(fn => fn.bind(null, formName));
      }
      if (result.after) {
        result.after = result.after.map(fn => fn.bind(null, formName));
      }
    }

    // merge formName-specific hooks with global hooks
    if (hooks?.[formName]?.before) {
      result = {
        ...(result ?? {} ),
        before: [...(result?.before ?? []), ...hooks?.[formName]?.before]
      };
    }
    if (hooks?.[formName]?.after) {
      result = {
        ...(result ?? {} ),
        after: [...(result?.after ?? []), ...hooks?.[formName]?.after]
      };
    }

    return result;    // defaults to undefined
  }
  
}
