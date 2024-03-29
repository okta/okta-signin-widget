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

import type { WidgetOptions } from '@okta/okta-signin-widget';
import type { DebuggerOptions } from '../../../src/plugins/OktaPluginDebugger';

declare global {
  interface Window {
    OktaSignInDebug: {
      init: (options?: DebuggerOptions) => void;
      destroy: () => void;
      isEnabled: () => boolean;
    }
  }
}

export type UnknownFn = (args?: unknown) => unknown;
export interface Config {
  bundle?: string;
  useMinBundle?: boolean;
  usePolyfill?: boolean;
  useBundledWidget?: boolean;
  widgetOptions?: WidgetOptions
}

// https://github.com/microsoft/TypeScript/issues/36217
export interface FormDataEvent extends Event {
  readonly formData: FormData;
}

export interface FormDataEventInit extends EventInit {
  formData: FormData;
}

export declare const FormDataEvent: {
  prototype: FormDataEvent;
  new(type: string, eventInitDict?: FormDataEventInit): FormDataEvent;
};
