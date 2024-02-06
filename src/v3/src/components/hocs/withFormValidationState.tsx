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

import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { useFormFieldValidation, useOnChange } from '../../hooks';
import { FieldElement, UISchemaElementComponent, WidgetMessage } from '../../types';
import { convertIdxMessageToWidgetMessage } from '../../util';
import { getDisplayName } from './getDisplayName';

export type RendererComponent<T> = {
  (props: T): h.JSX.Element;
  displayName: string;
  name?: string;
};

export type WrappedFunctionComponent<T> = (
  Component: UISchemaElementComponent<T>
) => RendererComponent<T>;

/**
 * Please name your wrapped component while exporting
 * This is needed for fast-refresh
 * @see https://github.com/preactjs/prefresh#recognition
 *
 * @example
 *  const WrappedSelect = withFormValidationState(Select);
 *  export default WrappedSelect;
 */
export const withFormValidationState: WrappedFunctionComponent<
{ uischema: FieldElement }> = (Component) => {
  const ParentComponent: RendererComponent<
  { uischema: FieldElement }> = (props: { uischema: FieldElement }) => {
    const { uischema } = props;
    const {
      ariaDescribedBy,
      options: {
        inputMeta: {
          // @ts-ignore TODO: OKTA-539834 - messages missing from type
          messages = {},
        },
      },
    } = uischema;
    const errorsFromSchema: WidgetMessage[] = messages?.value?.length
      && convertIdxMessageToWidgetMessage(messages?.value);
    const [touched, setTouched] = useState<boolean>(false);
    const [errors, setErrors] = useState<WidgetMessage[] | undefined>();
    const onValidateHandler = useFormFieldValidation(uischema);
    const onChangeHandler = useOnChange(uischema);

    const handleChange = (value: string | number | boolean) => {
      setTouched?.(true);
      onChangeHandler(value);
    };

    const handleBlur = (value: string | number | boolean) => {
      setTouched?.(true);
      onValidateHandler?.(setErrors, value);
    };

    // For server side errors, need to reset the touched value
    useEffect(() => {
      setTouched(false);
    }, [messages?.value]);

    const fieldErrors = touched ? errors : errorsFromSchema;
    const combinedProps = {
      ...props,
      touched,
      setTouched,
      errors: fieldErrors,
      setErrors,
      onValidateHandler,
      handleChange,
      handleBlur,
      describedByIds: ariaDescribedBy,
    };
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Component {...combinedProps} />;
  };
  ParentComponent.displayName = `WithFormValidationState(${getDisplayName(Component)})`;
  return ParentComponent;
};
