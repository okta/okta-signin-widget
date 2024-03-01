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

import { TextField } from '@okta/odyssey-react-mui';
import { h } from 'preact';
import { buildFieldLevelErrorMessages } from 'src/util/buildFieldLevelErrorMessages';

import { useWidgetContext } from '../../contexts';
import {
  useAutoFocus,
  useHtmlContentParser,
  useValue,
} from '../../hooks';
import {
  ChangeEvent,
  UISchemaElementComponent, UISchemaElementComponentWithValidationProps,
} from '../../types';
import { getTranslation } from '../../util';
import { withFormValidationState } from '../hocs';

const InputText: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  uischema,
  errors,
  handleChange,
  handleBlur,
}) => {
  const value = useValue(uischema);
  const { loading } = useWidgetContext();
  const {
    translations = [],
    focus,
    parserOptions,
  } = uischema;
  const label = getTranslation(translations, 'label');
  const hint = getTranslation(translations, 'hint');
  const explain = getTranslation(translations, 'bottomExplain');
  const {
    attributes,
    inputMeta: { name, required },
    dataSe,
  } = uischema.options;
  const { autocomplete, inputmode } = attributes || {};
  const focusRef = useAutoFocus<HTMLInputElement>(focus);
  const parsedExplainContent = useHtmlContentParser(explain, parserOptions);
  const { errorMessage, errorMessageList } = buildFieldLevelErrorMessages(errors);

  return (
    <TextField
      autoCompleteType={autocomplete}
      errorMessage={errorMessage}
      errorMessageList={errorMessageList}
      hint={hint ?? parsedExplainContent as string}
      id={name}
      inputRef={focusRef}
      inputMode={inputmode}
      isDisabled={loading}
      isFullWidth
      isOptional={required === false}
      name={name}
      label={label ?? ''}
      onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        handleChange?.(e.currentTarget.value);
      }}
      onBlur={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        handleBlur?.(e?.currentTarget?.value);
      }}
      testId={dataSe}
      type="text"
      value={value as string ?? ''}
    />
  );
};

const WrappedInputText = withFormValidationState(InputText);
export default WrappedInputText;
