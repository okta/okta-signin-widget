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
import { useCallback } from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import { useOnSubmit, useOnSubmitValidation } from '../../hooks';
import {
  SubmitEvent,
  UISchemaLayout,
} from '../../types';
import { getValidationMessages } from '../../util';
import Layout from './Layout';

const Form: FunctionComponent<{
  uischema: UISchemaLayout;
}> = ({ uischema }) => {
  const {
    data,
    idxTransaction: currTransaction,
    setMessage,
    dataSchemaRef,
  } = useWidgetContext();
  const onSubmitHandler = useOnSubmit();
  const onValidationHandler = useOnSubmitValidation();

  const handleSubmit = useCallback(async (e: SubmitEvent) => {
    e.preventDefault();
    setMessage(undefined);

    const {
      submit: {
        actionParams: params,
        step,
        includeImmutableData,
      },
    } = dataSchemaRef.current!;

    // client side validation - only validate for fields in nextStep
    const { nextStep } = currTransaction!;
    if (!step || step === nextStep!.name) {
      const dataSchema = dataSchemaRef.current!;
      const messages = getValidationMessages(
        dataSchema,
        dataSchema.fieldsToValidate,
        data,
        params,
      );
      // update transaction with client validation messages to trigger rerender
      if (messages) {
        onValidationHandler(messages);
        return;
      }
    }

    // submit request
    onSubmitHandler({
      includeData: true,
      includeImmutableData,
      params,
      step,
    });
  }, [currTransaction, data, dataSchemaRef, onSubmitHandler, onValidationHandler, setMessage]);

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="o-form" // FIXME update page objects using .o-form selectors
      data-se="form"
      style={{ maxWidth: '100%', overflowWrap: 'anywhere' }}
    >
      <Layout uischema={uischema} />
    </form>
  );
};

export default Form;
