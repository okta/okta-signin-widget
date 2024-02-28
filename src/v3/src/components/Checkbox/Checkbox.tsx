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

import { Checkbox as OdyCheckbox, CheckboxGroup } from '@okta/odyssey-react-mui';
import { h } from 'preact';

import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useHtmlContentParser, useValue } from '../../hooks';
import {
  ChangeEvent,
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { buildFieldLevelErrorMessages, getTranslationInfo, wrapInTranslateNo } from '../../util';
import { withFormValidationState } from '../hocs';

const Checkbox: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  uischema,
  errors,
  handleChange,
  handleBlur,
}) => {
  const value = useValue(uischema);
  const { loading } = useWidgetContext();

  const {
    options: { inputMeta: { name, mutable } },
    focus,
    translations = [],
  } = uischema;
  const isReadOnly = mutable === false;
  const checkboxId = `${name}-checkbox`;
  const labelInfo = getTranslationInfo(translations, 'label');
  const label = useHtmlContentParser(labelInfo?.noTranslate
    ? wrapInTranslateNo(labelInfo.value)
    : labelInfo?.value) as string | undefined;
  const descriptionInfo = getTranslationInfo(translations, 'description');
  const description = useHtmlContentParser(descriptionInfo?.noTranslate
    ? wrapInTranslateNo(descriptionInfo.value)
    : descriptionInfo?.value) as string | undefined;
  const focusRef = useAutoFocus<HTMLInputElement>(focus);
  const { errorMessage, errorMessageList } = buildFieldLevelErrorMessages(errors);

  return (
    <CheckboxGroup
      errorMessage={errorMessage}
      errorMessageList={errorMessageList}
      id={name}
      label=""
    >
      <OdyCheckbox
        hint={description}
        id={checkboxId}
        inputRef={focusRef}
        isChecked={value === true}
        isDisabled={loading || isReadOnly}
        label={label}
        name={name}
        onBlur={(e: ChangeEvent<HTMLInputElement>) => {
          handleBlur?.(e?.currentTarget?.checked);
        }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          handleChange?.(e.currentTarget.checked);
        }}
        testId={name}
      />
    </CheckboxGroup>
  );
};

const WrappedCheckbox = withFormValidationState(Checkbox);
export default WrappedCheckbox;
