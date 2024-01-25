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

import { Box } from '@mui/material';
import classNames from 'classnames';
import { FunctionComponent, h } from 'preact';
import { useCallback, useEffect } from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import { useOnSubmit, useOnSubmitValidation } from '../../hooks';
import {
  SubmitEvent,
  UISchemaLayout,
} from '../../types';
import { getValidationMessages, isCaptchaEnabled } from '../../util';
import InfoSection from '../InfoSection/InfoSection';
import Layout from './Layout';

const Form: FunctionComponent<{
  uischema: UISchemaLayout;
}> = ({ uischema }) => {
  const classes = classNames('o-form');
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

    // TODO: Can remove after OKTA-657627 is resolved
    if (!dataSchemaRef?.current?.submit) {
      return;
    }

    setMessage(undefined);

    const {
      submit: {
        actionParams: params,
        step,
        includeImmutableData,
      },
      captchaRef,
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

    if (currTransaction && isCaptchaEnabled(currTransaction)) {
      // launch the captcha challenge
      captchaRef?.current?.execute();
    } else {
      // submit request
      onSubmitHandler({
        includeData: true,
        includeImmutableData,
        params,
        step,
      });
    }
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
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit}
      className={classes} // TODO: FIXME OKTA-578584 - update page objects using .o-form selectors
      data-se="o-form"
      sx={{
        maxInlineSize: '100%',
        wordBreak: 'break-word',
      }}
      aria-live="polite"
    >
      <InfoSection message={message} />
      <Layout uischema={uischema} />
    </Box>
  );
};

export default Form;
