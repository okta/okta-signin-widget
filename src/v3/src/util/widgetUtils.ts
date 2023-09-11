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

import { isDevelopmentEnvironment } from './environmentUtils';

/* global __PREFRESH__ */

export const canBootstrapWidget = (deps: Record<string, unknown>) => {
  if (isDevelopmentEnvironment()) {
    /**
     * Only for HMR at development:
     *  If some file change triggers hot update of current file, all `useEffect` hooks will be triggered.
     *  `useCallback` hooks will be re-executed, so values of `bootstrap` and `resume` will be updated.
     *  But values of `useState` hooks will not update, so eg. `setIdxTransaction` value will remain.
     *  To avoid unnecessary `bootstrap` call, compare old and new values in reduced dependencies list.
     */
    if (typeof __PREFRESH__ !== 'undefined') {
      const prevDeps = __PREFRESH__.widgetBootstrapDeps as typeof deps;
      const depsChanged = !prevDeps || Object.keys(prevDeps).some((k) => deps[k] !== prevDeps[k]);
      __PREFRESH__.widgetBootstrapDeps = deps;
      if (!depsChanged) {
        // eslint-disable-next-line no-console
        console.info('[HMR] Skip Widget bootstrap');
        return false;
      }
    }
  }
  return true;
};
