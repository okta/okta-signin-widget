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

import Ajv, { ErrorObject } from 'ajv';
import AjvErrors from 'ajv-errors';
import { JsonFormsCore } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';
import { vanillaCells } from '@jsonforms/vanilla-renderers';
import { materialCells } from '@jsonforms/material-renderers';
import { Box } from '@mui/material';
import classNames from 'classnames';
import { FunctionComponent, h } from 'preact';
import { useCallback, useEffect } from 'preact/hooks';

import { useWidgetContext } from '../../../contexts';
import { useOnSubmit, useOnSubmitValidation } from '../../../hooks';
import {
  FormBag,
  SubmitEvent,
} from '../../../types';
import { isCaptchaEnabled } from '../../../util';
import { renderers } from './renderers';
import AuthContent from '../../../components/AuthContent/AuthContent';

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  $data: true,
});
AjvErrors(ajv, {});

const Form: FunctionComponent<{
  schema: FormBag['schema'];
  uischema: FormBag['uischema'];
}> = ({ schema, uischema }) => {
  const classes = classNames('o-form');
  const {
    data,
    idxTransaction: currTransaction,
    message,
    setMessage,
    dataSchemaRef,
    setWidgetRendered,
    setData,
    setFormErrors,
  } = useWidgetContext();
  const onSubmitHandler = useOnSubmit();
  const onValidationHandler = useOnSubmitValidation();

  const onChange = (event: Pick<JsonFormsCore, 'data' | 'errors'>) => {
    setFormErrors(event.errors || []);
    setData(event.data);
  };

  useEffect(() => {
    console.log('USEEFFECT for setWidgetRendered - currTransaction dependency');
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
      captchaRef,
    } = dataSchemaRef.current!;

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

  console.log('UI Schema:', JSON.stringify(uischema));

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
    >
      <AuthContent>
        <JsonForms
          schema={schema}
          uischema={uischema}
          data={data}
          renderers={renderers}
          cells={vanillaCells}
          // disable client side validation to pass parity stage testing
          // validationMode="NoValidation"
          ajv={ajv}
          // onChange={onChange}
          onChange={onChange}
        />
      </AuthContent>
    </Box>
  );
};

export default Form;
