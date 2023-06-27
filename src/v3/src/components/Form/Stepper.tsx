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

import { FunctionComponent, h } from 'preact';
import { useState } from 'preact/hooks';

import { StepperContext } from '../../contexts';
import { StepperLayout } from '../../types';
import LayoutContainer from './LayoutContainer';

type StepperProps = {
  uischema: StepperLayout;
};

const Stepper: FunctionComponent<StepperProps> = ({ uischema }) => {
  const { elements, options } = uischema;
  const [stepIndex, setStepIndex] = useState<number | undefined>(() => {
    if (!options?.defaultStepIndex) {
      return 0;
    }
    return options.defaultStepIndex() as number;
  });

  if (typeof stepIndex === 'undefined') {
    return null;
  }

  return (
    // Scope setStepIndex by only providing it to its own children components
    // Nested stepper can be supported with this pattern
    <StepperContext.Provider value={{ setStepIndex, stepIndex }}>
      <LayoutContainer uischema={elements[stepIndex]} />
    </StepperContext.Provider>
  );
};

export default Stepper;
