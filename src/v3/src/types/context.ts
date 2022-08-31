/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import {
  AuthApiError,
  IdxMessage,
  IdxTransaction,
  OktaAuth,
} from '@okta/okta-auth-js';
import { MutableRef, StateUpdater } from 'preact/hooks';

import { FormBag } from './schema';
import { WidgetProps } from './widget';

export type IWidgetContext = {
  authClient: OktaAuth;
  widgetProps: WidgetProps;
  setMessage: StateUpdater<IdxMessage | undefined>;
  // // TODO: OKTA-502849 - Update param type
  // (RenderSuccessCallback / RenderErrorCallback) once merged into okta-signin-widget
  onSuccessCallback?: (data: Record<string, unknown>) => void;
  onErrorCallback?: (data: Record<string, unknown>) => void;
  idxTransaction: IdxTransaction | undefined;
  setAuthApiError: StateUpdater<AuthApiError | null>;
  setIdxTransaction: StateUpdater<IdxTransaction | undefined>;
  setIsClientTransaction: StateUpdater<boolean>;
  stepToRender: string | undefined;
  setStepToRender: StateUpdater<string | undefined>;
  data: FormBag['data'];
  setData: StateUpdater<FormBag['data']>;
  dataSchemaRef: MutableRef<FormBag['dataSchema'] | undefined>;
};
