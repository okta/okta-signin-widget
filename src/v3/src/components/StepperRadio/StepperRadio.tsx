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
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import {
  ChangeEvent,
  StepperRadioElement,
  UISchemaElementComponent,
} from '../../types';

const StepperRadio: UISchemaElementComponent<{
  uischema: StepperRadioElement
}> = ({ uischema }) => {
  const { setStepperStepIndex, setData } = useWidgetContext();
  const {
    label = '',
    options: {
      id,
      customOptions,
      defaultOption,
    },
  } = uischema;
  const [value, setValue] = useState<string | boolean | number>(defaultOption ?? '');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const stepIdx = customOptions.findIndex((opt) => opt.value === e.currentTarget.value);
    const option = customOptions[stepIdx];
    setStepperStepIndex(stepIdx);
    setValue(e.currentTarget.value);

    // update data state
    if (option.key) {
      setData({ [option.key]: option.value });
    }
  };

  return (
    <FormControl component="fieldset">
      {label && (<FormLabel>{label}</FormLabel>)}
      <RadioGroup
        name={id}
        id={id}
        value={value as string}
        onChange={handleChange}
      >
        {
          customOptions?.map((item: IdxOption) => (
            <FormControlLabel
              control={<Radio />}
              key={item.value}
              value={item.value}
              label={item.label}
            />
          ))
        }
      </RadioGroup>
    </FormControl>
  );
};

export default StepperRadio;
