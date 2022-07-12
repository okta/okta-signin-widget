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

import { Radio as RadioOdyssey } from '@okta/odyssey-react';
import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { h } from 'preact';
import { ChangeEvent, FieldElement, UISchemaElementComponent } from 'src/types';

import { useWidgetContext } from '../../contexts';
import { useOnChange, useValue } from '../../hooks';
import { useTranslation } from '../../lib/okta-i18n';
import { getLabelName } from '../helpers';

const Radio: UISchemaElementComponent<{
  uischema: FieldElement
}> = ({ uischema }) => {
  const { t } = useTranslation();
  const { setStepperStepIndex } = useWidgetContext();
  const value = useValue(uischema);
  const onChangeHandler = useOnChange(uischema);
  const { label } = uischema;
  const {
    inputMeta: {
      // @ts-ignore expose type from auth-js
      messages = {},
      name,
      // required,
      options,
    },
    isStepper,
    customOptions,
  } = uischema.options;
  const error = t((messages.value || [])[0]?.i18n.key);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChangeHandler(e.target.value);
    if (isStepper) {
      const stepIdx = options!.findIndex((opt) => opt.value === e.target.value);
      setStepperStepIndex(stepIdx);
    }
  };

  return (
    <RadioOdyssey.Group
      error={error}
      name={name}
      label={t(getLabelName(label!))}
      id={name}
      value={value as string}
      // required={!uischema.options?.optionalLabel && dirty && !!errors}
      // optionalLabel={uischema.options?.optionalLabel}
      // @ts-ignore onChange event type here is complaining
      onChange={handleChange}
    >
      {
        (customOptions ?? options)?.map((item: IdxOption) => (
          <RadioOdyssey.Button
            key={item.value}
            value={item.value}
            label={t(item.label)}
          />
        ))
      }
    </RadioOdyssey.Group>
  );
};

export default Radio;
