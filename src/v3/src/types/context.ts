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
  OAuthError,
  OktaAuthIdxInterface,
} from '@okta/okta-auth-js';
import { Dispatch, MutableRef, StateUpdater } from 'preact/hooks';

import { FormBag, LanguageDirection, UISchemaLayoutType } from './schema';
import { WidgetProps } from './widget';

export type IWidgetContext = {
  authClient: OktaAuthIdxInterface;
  widgetProps: WidgetProps;
  message: IdxMessage | undefined;
  setMessage: Dispatch<StateUpdater<IdxMessage | undefined>>;
  onSuccessCallback?: WidgetProps['globalSuccessFn'];
  onErrorCallback?: WidgetProps['globalErrorFn'];
  idxTransaction: IdxTransaction | undefined;
  setResponseError: Dispatch<StateUpdater<AuthApiError | OAuthError | null>>;
  setIdxTransaction: Dispatch<StateUpdater<IdxTransaction | undefined>>;
  setIsClientTransaction: Dispatch<StateUpdater<boolean>>;
  stepToRender: string | undefined;
  setStepToRender: Dispatch<StateUpdater<string | undefined>>;
  data: FormBag['data'];
  setData: Dispatch<StateUpdater<FormBag['data']>>;
  dataSchemaRef: MutableRef<FormBag['dataSchema'] | undefined>;
  loading: boolean;
  setLoading: Dispatch<StateUpdater<boolean>>;
  setWidgetRendered: Dispatch<StateUpdater<boolean>>;
  loginHint?: string | null;
  setloginHint: Dispatch<StateUpdater<string | null>>;
  languageCode: string;
  languageDirection: LanguageDirection;
  setAbortController: Dispatch<StateUpdater<AbortController | undefined>>;
  abortController: AbortController | undefined;
};

// Stepper context
export type IStepperContext = {
  stepIndex: number;
  setStepIndex: Dispatch<StateUpdater<number | undefined>>;
};

// Layout context
export type ILayoutContext = {
  layoutDirection: UISchemaLayoutType.VERTICAL | UISchemaLayoutType.HORIZONTAL,
};
