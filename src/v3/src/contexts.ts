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

import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

import {
  ILayoutContext, IStepperContext, IWidgetContext, UISchemaLayoutType,
} from './types';

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

export const StepperContext = createContext<IStepperContext>({
  stepIndex: 0,
  setStepIndex: () => {},
});

export const useStepperContext = () => useContext(StepperContext);

export const LayoutContext = createContext<ILayoutContext>({
  layoutDirection: UISchemaLayoutType.VERTICAL,
});

export const useLayoutContext = () => useContext(LayoutContext);
