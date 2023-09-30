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

import { OktaAuthIdxInterface, Tokens } from '@okta/okta-auth-js';

import {
  HooksAPI,
  RenderErrorCallback,
  RenderResult,
  RenderSuccessCallback,
  RouterEventsAPI,
} from '../../../types';
import { RenderOptions, WidgetOptions } from './widget';

// Keep a duplicate OktaSignInAPI interface because the version of auth-js differs between
// Gen3 and Gen2 so there are type mismatches in their exposed type interfaces
export interface OktaSignInAPI extends HooksAPI, RouterEventsAPI {
  // Gen3 only
  readonly options: Pick<WidgetOptions, 'brandName'>;

  // Gen3 supports only IDX
  authClient: OktaAuthIdxInterface;
  show(): void;
  hide(): void;
  remove(): void;
  showSignIn(options: RenderOptions): Promise<RenderResult>;
  showSignInToGetTokens(options: RenderOptions): Promise<Tokens>;
  showSignInAndRedirect(options: RenderOptions): Promise<void>;
  renderEl(
    options: RenderOptions,
    success?: RenderSuccessCallback,
    error?: RenderErrorCallback
  ): Promise<RenderResult>;

  getUser(): void
}
