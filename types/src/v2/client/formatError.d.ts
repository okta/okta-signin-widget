/*!
 * Copyright (c) 2021-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
import { IdxResponse } from '@okta/okta-auth-js';
export interface LegacyIdxError {
    error: string;
    details: IdxResponse;
}
export interface StandardApiError {
    error: string;
    error_description: string;
}
export declare function isInvalidRecoveryTokenError(error: any): error is StandardApiError;
export declare function formatInvalidRecoveryTokenError(error: StandardApiError): LegacyIdxError;
export declare function isOIENotEnabledError(error: any): error is StandardApiError;
export declare function formatOIENotEnabledError(error: StandardApiError): StandardApiError;
export declare function isOIEConfigurationError(error: any): error is StandardApiError;
export declare function formatOIEConfigurationError(error: any): any;
export declare function formatIDXError(error: LegacyIdxError | StandardApiError | Error): LegacyIdxError;
export declare function formatError(error: string | Error | LegacyIdxError | StandardApiError): any;
//# sourceMappingURL=formatError.d.ts.map