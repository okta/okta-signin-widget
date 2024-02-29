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
import { MutableRef, StateUpdater } from 'preact/hooks';

import { FormBag, LanguageDirection, UISchemaLayoutType } from './schema';
import { WidgetProps } from './widget';
import { ErrorObject } from 'ajv';

export type IWidgetContext = {
  authClient: OktaAuthIdxInterface;
  widgetProps: WidgetProps;
  message: IdxMessage | undefined;
  setMessage: StateUpdater<IdxMessage | undefined>;
  onSuccessCallback?: WidgetProps['globalSuccessFn'];
  onErrorCallback?: WidgetProps['globalErrorFn'];
  idxTransaction: IdxTransaction | undefined;
  setResponseError: StateUpdater<AuthApiError | OAuthError | null>;
  setIdxTransaction: StateUpdater<IdxTransaction | undefined>;
  setIsClientTransaction: StateUpdater<boolean>;
  stepToRender: string | undefined;
  setStepToRender: StateUpdater<string | undefined>;
  data: FormBag['data'];
  setData: StateUpdater<FormBag['data']>;
  dataSchemaRef: MutableRef<FormBag['dataSchema'] | undefined>;
  loading: boolean;
  setLoading: StateUpdater<boolean>;
  setWidgetRendered: StateUpdater<boolean>;
  loginHint?: string | null;
  setloginHint: StateUpdater<string | null>;
  languageCode: string;
  languageDirection: LanguageDirection;
  setFormErrors: StateUpdater<ErrorObject[]>;
  formErrors: ErrorObject[] | undefined;
};

// Stepper context
export type IStepperContext = {
  stepIndex: number;
  setStepIndex: StateUpdater<number | undefined>;
};

// Layout context
export type ILayoutContext = {
  layoutDirection: UISchemaLayoutType.VERTICAL | UISchemaLayoutType.HORIZONTAL,
};
