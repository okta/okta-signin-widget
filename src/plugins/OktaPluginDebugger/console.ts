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

export type ConsoleMethod = Exclude<keyof Console, 'Console'>;
export interface ConsoleMessage {
  method: ConsoleMethod;
  args: any[];
  time?: string;
}
type OnNewMessage = (msg: ConsoleMessage) => void;

const consoleMethodsToOverride: ConsoleMethod[] = [
  'assert',
  'debug',
  'dir',
  'error',
  'group',
  'groupCollapsed',
  'groupEnd',
  'info',
  'log',
  'table',
  'warn',
];

let origConsole: Partial<Console> | undefined;
let onNewMessage: OnNewMessage | undefined;

export const addGlobalErrorListeners = () => {
  window.addEventListener('unhandledrejection', onUnhandledRejection);
  window.addEventListener('error', onGlobalError);
};

export const removeGlobalErrorListeners = () => {
  window.removeEventListener('unhandledrejection', onUnhandledRejection);
  window.removeEventListener('error', onGlobalError);
};

const onUnhandledRejection = (e: PromiseRejectionEvent) => {
  callConsole('error', 'Unhandled rejection', e.reason);
};

const onGlobalError = (e: ErrorEvent) => {
  callConsole('error', `${e.message} at ${e.filename}:${e.lineno}:${e.colno}`, e.error);
};

export const callConsole = (method: ConsoleMethod, ...args: any[]) => {
  window.console[method]?.call(window.console, ...args);
};

export const setOnNewMessage = (newCallback: OnNewMessage | undefined) => {
  onNewMessage = newCallback;
};

export const overrideConsole = () => {
  origConsole = {};
  for (const method of consoleMethodsToOverride) {
    origConsole[method] = window.console[method] as () => void;
    (window.console as any)[method] = (...args: any[]) => {
      try {
        origConsole?.[method]?.call(window.console, ...args);
      } catch (_e) {
        // IE11 can throw errors if dev tools are not available
      }
      const msg: ConsoleMessage = {method, args};
      onNewMessage?.(msg);
    }
  }
};

export const restoreConsole = () => {
  if (origConsole) {
    for (const method of consoleMethodsToOverride) {
      window.console[method] = origConsole[method] as any;
    }
    origConsole = undefined;
  }
};
