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
/// <reference types="backbone" />
import { Backbone, Router, BaseRouterOptions } from "../../packages/@okta/courage-dist/types/CourageForSigninWidget";
import Settings from "../models/Settings";
import Header from "../views/shared/Header";
import AppState from './models/AppState';
import { LegacyIdxError, StandardApiError } from './client/formatError';
import { RenderError, RenderResult } from "../types";
import { OktaAuth, IdxResponse } from '@okta/okta-auth-js';
import Hooks from "../models/Hooks";
export interface BaseLoginRouterOptions extends BaseRouterOptions, Backbone.RouterOptions {
    globalSuccessFn?: (res: RenderResult) => void;
    globalErrorFn?: (res: RenderError) => void;
    authClient?: OktaAuth;
    hooks: Hooks;
}
declare class BaseLoginRouter extends Router<Settings, BaseLoginRouterOptions> {
    Events: Backbone.Events;
    hasControllerRendered: boolean;
    settings: Settings;
    appState: AppState;
    hooks: Hooks;
    header: Header;
    constructor(options: BaseLoginRouterOptions);
    updateDeviceFingerprint(): void;
    handleUpdateAppState(idxResponse: IdxResponse): Promise<IdxResponse>;
    handleIdxResponseFailure(error?: LegacyIdxError): void;
    handleError(error?: LegacyIdxError | StandardApiError | Error): void;
    render(Controller: any, options?: {}): Promise<void>;
    /**
      * When "Remember My Username" is enabled, we save the identifier in a cookie
      * so that the next time the user visits the SIW, the identifier field can be
      * pre-filled with this value.
     */
    updateIdentifierCookie(idxResponse: IdxResponse): void;
    hasAuthenticationSucceeded(idxResponse: IdxResponse): true | import("@okta/okta-auth-js").IdxRemediation;
    restartLoginFlow(): void;
    start(): void;
    hide(): void;
    show(): void;
    remove(): void;
}
export default BaseLoginRouter;
//# sourceMappingURL=BaseLoginRouter.d.ts.map