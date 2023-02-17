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

import classNames from 'classnames';
import { FunctionComponent, h } from 'preact';
import { useCallback, useEffect } from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import { useOnSubmit, useOnSubmitValidation } from '../../hooks';
import {
  SubmitEvent,
  UISchemaLayout,
} from '../../types';
import { getValidationMessages } from '../../util';
import InfoSection from '../InfoSection/InfoSection';
import Layout from './Layout';
import style from './style.css';

const Form: FunctionComponent<{
  uischema: UISchemaLayout;
}> = ({ uischema }) => {
  const classes = classNames('o-form', style.siwForm);
  const {
    data,
    idxTransaction: currTransaction,
    message,
    setMessage,
    dataSchemaRef,
    setWidgetRendered,
  } = useWidgetContext();
  const onSubmitHandler = useOnSubmit();
  const onValidationHandler = useOnSubmitValidation();

  useEffect(() => {
    setWidgetRendered(true);
  }, [currTransaction, setWidgetRendered]);

  const handleSubmit = useCallback(async (e: SubmitEvent) => {
    e.preventDefault();
    setWidgetRendered(false);
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
  }, [
    currTransaction,
    data,
    dataSchemaRef,
    onSubmitHandler,
    onValidationHandler,
    setMessage,
    setWidgetRendered,
  ]);

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className={classes} // FIXME update page objects using .o-form selectors
      data-se="o-form"
    >
      <InfoSection message={message} />
      <Layout uischema={uischema} />
    </form>
  );
};

export default Form;
