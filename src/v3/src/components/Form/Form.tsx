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

import { FunctionComponent, h } from 'preact';

import { useWidgetContext } from '../../contexts';
import { useOnSubmit } from '../../hooks';
import {
  ButtonElement,
  ButtonType,
  isUISchemaLayoutType,
  SubmitEvent,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';
import { renderUISchemaLayout } from './renderUISchemaLayout';

const getSubmitButtonSchema: any = (uischema: UISchemaLayout, stepperStepIndex: number) => {
  const { type, elements } = uischema;
  if (type === UISchemaLayoutType.STEPPER) {
    return getSubmitButtonSchema(
      (elements as UISchemaLayout[])[stepperStepIndex],
      stepperStepIndex,
    );
  }

  return elements.reduce((acc, element) => {
    if (isUISchemaLayoutType(element.type)) {
      return getSubmitButtonSchema(element as UISchemaLayout, stepperStepIndex);
    }

    if ((element as ButtonElement).options.type === ButtonType.SUBMIT) {
      return acc || element;
    }

    return acc;
  }, null);
};

const Form: FunctionComponent<{
  uischema: UISchemaLayout;
}> = ({ uischema }) => {
  const { stepperStepIndex } = useWidgetContext();
  const onSubmitHandler = useOnSubmit();

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    const submitButtonSchema = getSubmitButtonSchema(uischema, stepperStepIndex);
    onSubmitHandler({
      includeData: true,
      params: submitButtonSchema?.options?.idxMethodParams,
      step: submitButtonSchema?.options?.step,
    });
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
    >
      {renderUISchemaLayout(uischema)}
    </form>
  );
};

export default Form;
