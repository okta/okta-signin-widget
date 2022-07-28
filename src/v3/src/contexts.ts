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

import { IdxMessage, IdxTransaction, OktaAuth } from '@okta/okta-auth-js';
import { createContext } from 'preact';
import { MutableRef, StateUpdater, useContext } from 'preact/hooks';

import {
  ActionOptions,
  FormBag,
  WidgetProps,
} from './types';

// Widget context
type IWidgetContext = {
  authClient: OktaAuth;
  widgetProps: WidgetProps;
  setMessages: StateUpdater<IdxMessage[]>;
  // // TODO: OKTA-502849 - Update param type
  // (RenderSuccessCallback / RenderErrorCallback) once merged into okta-signin-widget
  onSuccessCallback?: (data: Record<string, unknown>) => void;
  onErrorCallback?: (data: Record<string, unknown>) => void;
  idxTransaction: IdxTransaction | undefined;
  setIdxTransaction: StateUpdater<IdxTransaction | undefined>;
  stepToRender: string | undefined;
  setStepToRender: StateUpdater<string | undefined>;
  data: Record<string, unknown>;
  setData: StateUpdater<Record<string, unknown>>;
  dataSchemaRef: MutableRef<FormBag['dataSchema'] | undefined>;
};

const createWidgetContext = <T extends unknown>() => {
  // Create a context with a generic parameter or undefined
  const genericContext = createContext<T | undefined>(undefined);

  // Check if the value provided to the context is defined or throw an error
  const useWidgetContext = () => {
    const contextIsDefined = useContext(genericContext);
    if (!contextIsDefined) {
      throw new Error('useWidgetContext must be used within a Provider');
    }
    return contextIsDefined;
  };

  return [useWidgetContext, genericContext.Provider] as const;
};

const [useWidgetContext, WidgetContextProvider] = createWidgetContext<IWidgetContext>();

export { useWidgetContext, WidgetContextProvider };

// Form context
type IFormContext = {
  submissionOptionsRef: MutableRef<ActionOptions | undefined>;
};

export const FormContext = createContext<IFormContext>({} as IFormContext);

export const useFormContext = () => useContext(FormContext);

// Stepper context
type IStepperContext = {
  setStepIndex: StateUpdater<number | undefined>;
};

export const StepperContext = createContext<IStepperContext>({
  setStepIndex: () => {},
});

export const useStepperContext = () => useContext(StepperContext);
