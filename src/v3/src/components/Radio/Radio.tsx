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

import { Radio as OdyRadio, RadioGroup } from '@okta/odyssey-react-mui';
import { IdxOption } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';
import { h } from 'preact';

import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useValue } from '../../hooks';
import {
  ChangeEvent,
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { buildFieldLevelErrorMessages, getTranslation } from '../../util';
import { withFormValidationState } from '../hocs';

const Radio: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  uischema,
  errors,
  handleChange,
  handleBlur,
}) => {
  const value = useValue(uischema);
  const { loading } = useWidgetContext();
  const {
    translations = [],
    options: {
      inputMeta: {
        name,
        options,
        required,
      },
      customOptions,
    },
    focus,
  } = uischema;
  const label = getTranslation(translations, 'label');
  const optionalLabel = getTranslation(translations, 'optionalLabel');
  const focusRef = useAutoFocus<HTMLInputElement>(focus);
  const { errorMessage, errorMessageList } = buildFieldLevelErrorMessages(errors);

  return (
    <RadioGroup
      errorMessage={errorMessage}
      errorMessageList={errorMessageList}
      hint={!required ? optionalLabel : undefined}
      id={name}
      label={label ?? ''}
      name={name}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        handleChange?.(e.currentTarget.value);
      }}
      testId={name}
      value={value as string ?? ''}
    >
      {
        (customOptions ?? options ?? []).map((item: IdxOption, index: number) => (
          <OdyRadio
            isDisabled={loading}
            key={item.value}
            label={item.label}
            onBlur={(e: ChangeEvent<HTMLInputElement>) => {
              handleBlur?.(e?.currentTarget?.value);
            }}
            value={typeof item.value === 'string' ? item.value : ''}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(index === 0 && { inputFocusRef: focusRef })}
          />
        ))
      }
    </RadioGroup>
  );
};

const WrappedRadio = withFormValidationState(Radio);
export default WrappedRadio;
