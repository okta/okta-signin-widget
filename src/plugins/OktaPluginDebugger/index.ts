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

import '../../../polyfill/debugger';
import {
  addGlobalErrorListeners,
  removeGlobalErrorListeners,
  overrideConsole,
  restoreConsole,
  setOnNewMessage,
} from './console';
import {
  overrideFetch,
  restoreFetch,
  setOnNewFetch,
} from './fetch';
import {
  fetchDataToMessage,
  addMessage,
  clearMessages,
} from './messages';
import {
  initUI,
  removeUI,
  renderMessageToList,
} from './ui';

export interface DebuggerOptions {
  cspNonce?: string;
  watchNetwork?: boolean;
}

declare global {
  interface Window {
    OktaSignInDebug: {
      init: typeof initDebugger;
      destroy: typeof destroyDebugger;
      isEnabled: typeof isDebuggerEnabled;
    }
  }
}

let isEnabled = false;

export const isDebuggerEnabled = () => isEnabled;

export const initDebugger = (options?: DebuggerOptions): void => {
  if (isEnabled) {
    return;
  }
  setOnNewMessage((msg) => {
    addMessage(msg);
    renderMessageToList(msg);
  });
  setOnNewFetch((fetchData) => {
    const msg = fetchDataToMessage(fetchData);
    addMessage(msg);
    renderMessageToList(msg);
  });
  addGlobalErrorListeners();
  overrideConsole();
  if (options?.watchNetwork !== false) {
    overrideFetch();
  }
  initUI(options?.cspNonce);
  isEnabled = true;
};

export const destroyDebugger = (): void => {
  if (!isEnabled) {
    return;
  }
  removeGlobalErrorListeners();
  restoreConsole();
  restoreFetch();
  removeUI();
  setOnNewMessage(undefined);
  setOnNewFetch(undefined);
  clearMessages();
  isEnabled = false;
};

// expose to window
window.OktaSignInDebug = {
  init: initDebugger,
  destroy: destroyDebugger,
  isEnabled: isDebuggerEnabled,
};
