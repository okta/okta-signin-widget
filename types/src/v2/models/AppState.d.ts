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
import { Model, ModelProperty } from "../../../packages/@okta/courage-dist/types/CourageForSigninWidget";
/**
 * Keep track of stateMachine with this special model. Similar to `src/models/AppState.js`
 */
declare const local: Record<string, ModelProperty>;
declare const derived: Record<string, ModelProperty>;
export declare type AppStateProps = typeof local & typeof derived;
export default class AppState extends Model {
    get<A extends Backbone._StringKey<AppStateProps>>(attributeName: A): any;
    preinitialize(...args: any[]): void;
    isIdentifierOnlyView(): boolean;
    hasRemediationObject(formName: any): any;
    hasActionObject(actionName: any): boolean;
    getRemediationAuthenticationOptions(formName: any): any;
    getActionByPath(actionPath: any): any;
    getCurrentViewState(): any;
    /**
     * Returns ui schema of the form field from current view state
     * @param {string} fieldName
     * @returns {}
     */
    getSchemaByName(fieldName: any): any;
    /**
     * Returns the displayName of the authenticator
     * @returns {string}
     */
    getAuthenticatorDisplayName(): any;
    /**
     * Checks to see if we're in an authenticator challenge flow.
     * @returns {boolean}
     */
    isAuthenticatorChallenge(): boolean;
    shouldReRenderView(transformedResponse: any): boolean;
    getRefreshInterval(transformedResponse: any): any;
    shouldShowSignOutLinkInCurrentForm(hideSignOutLinkInMFA: any): boolean;
    containsMessageWithI18nKey(keys: any): any;
    containsMessageStartingWithI18nKey(keySubStr: any): any;
    clearAppStateCache(): void;
    setIonResponse(transformedResponse: any, hooks: any): Promise<void>;
    getUser(): any;
    _isReRenderRequired(identicalResponse: any, transformedResponse: any, previousRawState: any): boolean;
    /**
     * This is to account for the edge case introduced by this issue: OKTA-419210. With the current idx remediations,
     * there's no good way to generalize this as the backend handles the authenticators for phone, sms and
     * email differently. Although not ideal, we have to keep this check in for now until we find a better solution.
     */
    _isChallengeAuthenticatorPoll(transformedResponse: any, previousRawState: any): boolean;
}
export {};
//# sourceMappingURL=AppState.d.ts.map