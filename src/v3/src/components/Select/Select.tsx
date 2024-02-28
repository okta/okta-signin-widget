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

import { SelectChangeEvent } from '@mui/material';
import { NativeSelect } from '@okta/odyssey-react-mui';
import { IdxOption } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';
import { h } from 'preact';

import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useValue } from '../../hooks';
import {
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { buildFieldLevelErrorMessages, getTranslation } from '../../util';
import { withFormValidationState } from '../hocs';

const Select: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  uischema,
  errors,
  handleChange,
  handleBlur,
}) => {
  const value = useValue(uischema);
  const { loading } = useWidgetContext();
  const { focus, translations = [] } = uischema;
  const label = getTranslation(translations, 'label');
  const emptyOptionLabel = getTranslation(translations, 'empty-option-label');
  const { errorMessage, errorMessageList } = buildFieldLevelErrorMessages(errors);

  const {
    attributes,
    inputMeta: {
      name,
      options,
      required,
    },
    customOptions,
  } = uischema.options;
  const { autocomplete } = attributes || {};
  const focusRef = useAutoFocus<HTMLSelectElement>(focus);

  const getOptions = (): IdxOption[] | undefined => {
    if (Array.isArray(customOptions) || Array.isArray(options)) {
      return customOptions ?? options;
    }

    if (typeof options === 'object') {
      return Object.entries(options)
        .filter(([key, val]) => key !== '' && val !== '')
        .map(([key, val]) => ({ label: val, value: key } as IdxOption));
    }
    return undefined;
  };

  return (
    <NativeSelect
      autoCompleteType={autocomplete}
      errorMessage={errorMessage}
      errorMessageList={errorMessageList}
      id={name}
      inputRef={focusRef}
      isDisabled={loading}
      isOptional={required === false}
      label={label}
      onChange={(e: SelectChangeEvent<string>) => {
        const selectTarget = (
          e?.target as SelectChangeEvent['target'] & { value: string; name: string; }
        );
        handleChange?.(selectTarget.value);
      }}
      onBlur={(e: SelectChangeEvent<string>) => {
        const selectTarget = (
          e?.target as SelectChangeEvent['target'] & { value: string; name: string; }
        );
        handleBlur?.(selectTarget.value);
      }}
      testId={name}
      value={value as string ?? ''}
    >
      {
        [
          <option
            value=""
            key="empty"
          >
            {emptyOptionLabel}
          </option>,
        ].concat(
          getOptions()?.map((option: IdxOption) => (
            <option
              key={option.value}
              value={option.value as string}
            >
              {option.label}
            </option>
          )) || [],
        )
      }
    </NativeSelect>
  );
};

const WrappedSelect = withFormValidationState(Select);
export default WrappedSelect;
