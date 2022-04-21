/// <reference types="backbone" />
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
import { Model, ModelProperty } from "../../packages/@okta/courage-dist/types/CourageForSigninWidget";
import Q from 'q';
import { OktaAuth } from '@okta/okta-auth-js';
declare const local: Record<string, ModelProperty>;
declare const derived: Record<string, ModelProperty>;
declare type SettingsProps = typeof local & typeof derived;
export default class Settings extends Model {
    authClient: OktaAuth;
    get<A extends Backbone._StringKey<SettingsProps>>(attributeName: A): any;
    preinitialize(...args: any[]): void;
    initialize(options: any): void;
    setAcceptLanguageHeader(authClient: any): void;
    setAuthClient(authClient: any): void;
    getAuthClient(): OktaAuth;
    set(...args: any[]): any;
    callGlobalSuccess(status: any, data: any): void;
    callGlobalError(err: any): void;
    transformUsername(username: any, operation: any): any;
    processCreds(creds: any): Q.Promise<unknown>;
    parseRegistrationSchema(schema: any, onSuccess: any, onFailure: any): void;
    preRegistrationSubmit(postData: any, onSuccess: any, onFailure: any): void;
    postRegistrationSubmit(response: any, onSuccess: any, onFailure: any): void;
    parse(options: any): any;
    isDsTheme(): boolean;
}
export {};
//# sourceMappingURL=Settings.d.ts.map