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

import { IdxMessage } from '@okta/okta-auth-js';
import { clone } from 'lodash';
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
import { resetMessagesToInputs } from '../../util';
import { renderUISchemaLayout } from './renderUISchemaLayout';

// TODO: remove this function once submission related meta is in schema
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
  const {
    stepperStepIndex,
    formBag,
    data,
    idxTransaction: currTransaction,
    setIdxTransaction,
  } = useWidgetContext();
  const onSubmitHandler = useOnSubmit();

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    const submitButtonSchema = getSubmitButtonSchema(uischema, stepperStepIndex);
    const { actionParams: params, step } = submitButtonSchema?.options || {};

    // client side validation - only validate for fields in nextStep
    const { nextStep } = currTransaction!;
    if (!step || step === nextStep!.name) {
      // aggregate field level messages based on validation rules in each field
      const messages = Object.entries(formBag.dataSchema)
        .reduce((acc: Record<string, Partial<IdxMessage>>, curr) => {
          const [name, elementSchema] = curr;
          if (typeof elementSchema.validate === 'function') {
            const message = elementSchema.validate({
              ...data,
              ...params,
            });
            if (message) {
              acc[name] = message;
            }
          }
          return acc;
        }, {});
      // update transaction with client validation messages to trigger rerender
      if (Object.entries(messages).length) {
        const newTransaction = clone(currTransaction);
        resetMessagesToInputs(newTransaction!.nextStep!.inputs!, messages);
        setIdxTransaction(newTransaction);
        return;
      }
    }

    // submit request
    onSubmitHandler({
      includeData: true,
      params,
      step,
    });
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="o-form" // FIXME update page objects using .o-form selectors
      data-se="form"
    >
      {renderUISchemaLayout(uischema)}
    </form>
  );
};

export default Form;
