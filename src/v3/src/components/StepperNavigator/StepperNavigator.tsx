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

import { useEffect } from 'preact/hooks';

import { useStepperContext } from '../../contexts';
import { StepperNavigatorElement, UISchemaElementComponent } from '../../types';

// This component is used to execute a custom callback within a Stepper layout context
const StepperNavigator: UISchemaElementComponent<{
  uischema: StepperNavigatorElement
}> = ({ uischema }) => {
  const stepperContext = useStepperContext();
  const {
    options: {
      callback,
    },
  } = uischema;

  useEffect(() => {
    callback(stepperContext);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default StepperNavigator;
