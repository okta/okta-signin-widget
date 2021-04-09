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

import { OktaAuth, OktaAuthOptions, Tokens } from '@okta/okta-auth-js';

export type UnknownFn = (args?: unknown) => unknown;
export interface Config {
  issuer?: string;
  baseUrl?: string;
  clientId?: string;
  redirectUri?: string;
  authParams?: OktaAuthOptions;
  useInteractionCodeFlow: boolean;
  flow?: string;
}

export interface SessionInterface {
  setCookieAndRedirect(url?: string): void;
}
export interface RenderResponse {
  tokens?: Tokens;
  status?: string;
  session?: SessionInterface;
}
export declare interface RenderOptions {
  el?: string;
}

export interface WidgetError {
  errorSummary: string;
  errorCode: string;
  errorLink: string;
  errorId: string;
  errorCauses: string[];
  xhr?: XMLHttpRequest;
}
export declare class OktaSignIn {
  constructor(options: Config);
  authClient: OktaAuth;
  showSignIn(options: RenderOptions): Promise<RenderResponse>;
  showSignInToGetTokens(options: RenderOptions): Promise<Tokens>;
  showSignInAndRedirect(options: RenderOptions): Promise<void>;
  renderEl(
    options: RenderOptions,
    success?: (res: RenderResponse) => void,
    error?: (err: WidgetError) => void
  ): Promise<RenderResponse>;
  
  renderEl(options: RenderOptions, successFn?: UnknownFn, errorFn?: UnknownFn): Promise<RenderResponse>;
  remove(): void;
  on(event: string, fn: UnknownFn): void;
  show(): void;
  hide(): void;
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
