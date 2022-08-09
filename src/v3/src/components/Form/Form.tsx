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
import { useCallback } from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import { useOnSubmit } from '../../hooks';
import {
  DataSchema, SubmitEvent, UISchemaLayout,
} from '../../types';
import { loc, resetMessagesToInputs } from '../../util';
import Layout from './Layout';

const Form: FunctionComponent<{
  uischema: UISchemaLayout;
}> = ({ uischema }) => {
  const {
    data,
    idxTransaction: currTransaction,
    setIdxTransaction,
    setIsClientTransaction,
    setMessage,
    dataSchemaRef,
    additionalData,
  } = useWidgetContext();
  const onSubmitHandler = useOnSubmit();

  const handleSubmit = useCallback(async (e: SubmitEvent) => {
    e.preventDefault();
    setMessage(undefined);

    const {
      submit: {
        actionParams: params,
        step,
        includeImmutableData,
      },
      fieldsToValidate,
    } = dataSchemaRef.current!;

    // client side validation - only validate for fields in nextStep
    const { nextStep } = currTransaction!;
    if (!step || step === nextStep!.name) {
      // aggregate field level messages based on validation rules in each field
      const messages = Object.entries(dataSchemaRef.current!)
        .reduce((acc: Record<string, Partial<IdxMessage & { name?: string }>[]>, curr) => {
          const name = curr[0];
          const elementSchema = curr[1] as DataSchema;
          if (fieldsToValidate.includes(name) && typeof elementSchema.validate === 'function') {
            const validationMessages = elementSchema.validate({
              ...additionalData,
              ...data,
              ...params,
            });
            if (validationMessages?.length) {
              acc[name] = [...validationMessages];
            }
          }
          return acc;
        }, {});
      // update transaction with client validation messages to trigger rerender
      if (Object.entries(messages).length) {
        const newTransaction = clone(currTransaction);
        resetMessagesToInputs(newTransaction!.nextStep!.inputs!, messages);
        setMessage({
          message: loc('oform.errorbanner.title', 'login'),
          class: 'ERROR',
          i18n: { key: 'oform.errorbanner.title' },
        } as IdxMessage);
        setIsClientTransaction(true);
        setIdxTransaction(newTransaction);
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
  }, [
    data,
    additionalData,
    currTransaction,
    dataSchemaRef,
    setIdxTransaction,
    setIsClientTransaction,
    onSubmitHandler,
    setMessage,
  ]);

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="o-form" // FIXME update page objects using .o-form selectors
      data-se="form"
    >
      <Layout uischema={uischema} />
    </form>
  );
};

export default Form;
