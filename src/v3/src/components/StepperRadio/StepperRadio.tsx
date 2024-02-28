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

import { Radio, RadioGroup } from '@okta/odyssey-react-mui';
import { IdxOption } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import { useStepperContext, useWidgetContext } from '../../contexts';
import { useAutoFocus } from '../../hooks';
import {
  ChangeEvent,
  StepperRadioElement,
  UISchemaElementComponent,
} from '../../types';

const StepperRadio: UISchemaElementComponent<{
  uischema: StepperRadioElement
}> = ({ uischema }) => {
  const { setStepIndex, stepIndex } = useStepperContext();
  const widgetContext = useWidgetContext();
  const { setData, setMessage, loading } = widgetContext;
  const {
    label = '',
    focus,
    options: {
      name,
      customOptions,
      defaultValue,
    },
  } = uischema;
  const [value, setValue] = useState<string | boolean | number>(() => {
    if (!defaultValue) {
      return 0;
    }
    return defaultValue(widgetContext, stepIndex);
  });
  const focusRef = useAutoFocus<HTMLInputElement>(focus);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const stepIdx = customOptions.findIndex((opt) => opt.value === e.currentTarget.value);
    const option = customOptions[stepIdx];
    option.callback(widgetContext, stepIdx);
    setStepIndex(stepIdx);
    setValue(e.currentTarget.value);

    // update data state
    if (option.key) {
      setData({ [option.key]: option.value });
    }

    // reset form level alert message
    setMessage(undefined);
  };

  return (
    <RadioGroup
      id={name}
      label={label}
      name={name}
      onChange={handleChange}
      testId={name}
      value={value as string ?? ''}
    >
      {
        customOptions?.map((item: IdxOption, index: number) => (
          <Radio
            isDisabled={loading}
            key={item.value}
            label={item.label}
            value={typeof item.value === 'string' ? item.value : ''}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(index === 0 && { inputFocusRef: focusRef })}
          />
        ))
      }
    </RadioGroup>
  );
};

export default StepperRadio;
