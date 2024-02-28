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

import { PasswordField } from '@okta/odyssey-react-mui';
import { h } from 'preact';
import { buildFieldLevelErrorMessages } from 'src/util/buildFieldLevelErrorMessages';

import { useWidgetContext } from '../../contexts';
import {
  useAutoFocus,
  useHtmlContentParser,
  useValue,
} from '../../hooks';
import {
  AutoCompleteValue,
  ChangeEvent,
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { getTranslation } from '../../util';
import { withFormValidationState } from '../hocs';

type PasswordAutoCompleteValue = Extract<AutoCompleteValue, 'current-password' | 'new-password'> | undefined;

const InputPassword: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  uischema,
  errors,
  handleChange,
  handleBlur,
  describedByIds,
}) => {
  const value = useValue(uischema);
  // TODO: OKTA-623544 - this FF will be deprecated for SIW v3 post-GA
  // Sets showPasswordToggleOnSignInPage default value to true for parity with v2
  const {
    loading,
    widgetProps: { features: { showPasswordToggleOnSignInPage = true } = {} },
  } = useWidgetContext();
  const {
    translations = [],
    focus,
    parserOptions,
    noTranslate,
  } = uischema;
  const {
    attributes,
    inputMeta: { name, required },
  } = uischema.options;
  const { autocomplete } = attributes || {};
  const label = getTranslation(translations, 'label');
  const hint = getTranslation(translations, 'hint');
  const explain = getTranslation(translations, 'bottomExplain');
  const focusRef = useAutoFocus<HTMLInputElement>(focus);
  const parsedExplainContent = useHtmlContentParser(explain, parserOptions);
  const { errorMessage, errorMessageList } = buildFieldLevelErrorMessages(errors);

  return (
    <PasswordField
      ariaDescribedBy={describedByIds}
      autoCompleteType={autocomplete as PasswordAutoCompleteValue}
      errorMessage={errorMessage}
      errorMessageList={errorMessageList}
      hasShowPassword={showPasswordToggleOnSignInPage}
      hint={hint ?? parsedExplainContent as string}
      id={name}
      inputRef={focusRef}
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
      testId={name}
      translate={noTranslate ? 'no' : undefined}
      value={value as string ?? ''}
    />
  );
};

const WrappedInputPassword = withFormValidationState(InputPassword);
export default WrappedInputPassword;
