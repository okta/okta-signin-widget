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

import { JsonFormsCore } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';
import {
  vanillaCells,
} from '@jsonforms/vanilla-renderers';
import { Box, CircularLoadIndicator } from '@okta/odyssey-react';
import {
  IdxMessage,
  IdxStatus,
  IdxTransaction,
} from '@okta/okta-auth-js';
import Ajv, { ErrorObject } from 'ajv';
import AjvErrors from 'ajv-errors';
import { debounce } from 'lodash';
import { FunctionComponent, h } from 'preact';
import {
  useCallback,
  useEffect,
  useState,
} from 'preact/hooks';
import { JsonObject } from 'src/types/json';
import { FormBag } from 'src/types/jsonforms';
import { IdxMethod, WidgetProps } from 'src/types/widget';

import { useTranslation } from '../../lib/okta-i18n';
import transformAuthJs from '../../transformer/authJs';
import transformTerminalTransaction from '../../transformer/terminal';
import { buildAuthCoinProps, checkIdxTransactionWithNextStep } from '../../util';
import AuthContainer from '../AuthContainer/AuthContainer';
import AuthContent from '../AuthContent/AuthContent';
import AuthHeader from '../AuthHeader/AuthHeader';
import InfoSection from '../InfoSection/InfoSection';
import { Message } from '../Message/Message';
import { renderers } from '../renderers';

const ajv = new Ajv({
  schemaId: 'auto',
  // errorDataPath is required to be 'property' for JsonForms to pass error messages
  // to individual component renderers correctly
  // However, this breaks custom error messages via ajv-errors
  // For now, we will keep it this way and solve custom errors later
  // TODO: OKTA-462462
  errorDataPath: 'property',
  allErrors: true,
  jsonPointers: true,
  verbose: true,
  $data: true,
});
AjvErrors(ajv, {});

// idx method
let idxMethodName: IdxMethod = 'authenticate';
const SKIP_FORM_ERRORS_METHODS = ['recoverPassword', 'register', 'unlockAccount'];

export const Widget: FunctionComponent<WidgetProps> = ({
  logo,
  logoText,
  brandName,
  authClient,
  stateToken,
}) => {
  if (!authClient) {
    throw new Error('authClient is required');
  }

  const { t } = useTranslation();

  const [formBag, setFormBag] = useState<Partial<FormBag>>({
    envelope: {},
    data: {},
    uischema: {
      type: 'VerticalLayout',
      elements: [],
    },
  });
  const [displayState, setDisplayState] = useState<IdxStatus>(IdxStatus.PENDING);
  const [formErrors, setFormErrors] = useState<ErrorObject[]>([]);
  const [messages, setMessages] = useState<IdxMessage[]>([]);
  const [idxTransaction, setIdxTransaction] = useState<IdxTransaction | undefined>();

  // Define theme prop.
  // Theme handle logic will be implemented further.
  const [theme] = useState<string>('');

  const bootstrap = useCallback(async () => {
    setMessages([]);

    const transaction = await authClient.idx.startTransaction({
      stateHandle: stateToken,
    });
    if (transaction.status === IdxStatus.TERMINAL || transaction.error) {
      setIdxTransaction(transaction);
      setFormBag(transformTerminalTransaction(transaction));
      return;
    }
    // This may not be necessary after auth-js changes OKTA-484930
    checkIdxTransactionWithNextStep(transaction);
    setIdxTransaction(transaction);

    setFormBag(transformAuthJs(transaction));
  }, [authClient, stateToken]);

  const proceed = useCallback(async (
    { newIdxMethodName, params }:
    { newIdxMethodName?: IdxMethod, params?: JsonObject },
  ) => {
    idxMethodName = newIdxMethodName || idxMethodName;

    // resend message calls should proceed even when fields are not filled in
    const isResendFlow = params?.resend === true;
    if (
      !isResendFlow
      && !SKIP_FORM_ERRORS_METHODS.includes(idxMethodName)
      && formErrors.length > 0
    ) {
      return;
    }
    // Clear messages out before beginning transaction
    setMessages([]);

    const fnParams = params || formBag.data;
    const idxMethodFn = authClient.idx[idxMethodName];

    const transaction: IdxTransaction = await idxMethodFn({
      ...fnParams,
      stateHandle: stateToken && idxTransaction?.context.stateHandle,
    });
    setIdxTransaction(transaction);

    // TODO: 2. Does AuthJS support the current flow?
    const authJsSupportedFlow = true;
    if (!authJsSupportedFlow) {
      // TODO: 2A. Not supported by AuthJS
      // eslint-disable-next-line no-console,no-underscore-dangle
      console.warn('Flow unsupported by AuthJS, IDX Response:', transaction.rawIdxState);
      return;
    }

    const { messages: newMessages } = transaction;
    // 3A. Let AuthJS handle this flow
    switch (transaction.status) {
      case (IdxStatus.PENDING): {
        // Handle global errors or warnings
        if (newMessages) {
          setMessages(newMessages);
        }

        // This may not be necessary after auth-js changes OKTA-484930
        checkIdxTransactionWithNextStep(transaction);
        setIdxTransaction(transaction);

        setFormBag(transformAuthJs(transaction));

        const { nextStep } = transaction;
        if (nextStep.poll) {
          // handle polling behavior if necessary
          const { required, refresh } = nextStep.poll;

          if (required && refresh) {
            proceed({ newIdxMethodName: 'poll', params: { refresh } });
          }
        }
        break;
      }
      case (IdxStatus.SUCCESS): {
        setDisplayState(IdxStatus.SUCCESS);
        break;
      }
      case (IdxStatus.TERMINAL): {
        setFormBag(transformTerminalTransaction(transaction));
        break;
      }
      default: {
        // error statuses: CANCELED or TERMINAL or FAILURE.
        setDisplayState(transaction.status);
        if (newMessages) {
          // Set error.
          setMessages(newMessages);
        }
      }
    }
  }, [formBag.data, formErrors.length, authClient.idx]);

  const reset = useCallback(async (newIdxMethodName?: IdxMethod) => {
    await authClient.idx.cancel();

    if (newIdxMethodName) {
      return proceed({ newIdxMethodName, params: formBag.data });
    }
    authClient.idx.setFlow('default');
    idxMethodName = 'authenticate';
    return bootstrap();
  }, [bootstrap, formBag.data, authClient.idx, proceed]);

  // For fixing screen
  const delay = debounce((event) => {
    setFormErrors(event.errors || []);
    setFormBag({
      ...formBag,
      data: event.data,
    });
  }, 100);

  const onChange = (event: Pick<JsonFormsCore, 'data' | 'errors'>) => {
    delay(event);
  };

  useEffect(() => {
    // 1. Initialize AuthJS for initial request to IDX
    bootstrap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // In case of SUCCESS show success screen.
  // This logic could be changed in further.
  if (displayState === IdxStatus.SUCCESS) {
    return (
      <Message
        type={displayState}
        message={IdxStatus.SUCCESS}
      />
    );
  }

  // 5A. Render pending state
  return (
    <AuthContainer>
      <AuthHeader
        logo={logo}
        logoText={logoText}
        brandName={brandName}
        authCoinProps={buildAuthCoinProps(idxTransaction)}
      />
      <AuthContent>
        <InfoSection messages={messages} />
        {
          formBag.schema ? (
            <form noValidate>
              <JsonForms
                schema={formBag.schema}
                uischema={formBag.uischema}
                data={formBag.data}
                renderers={renderers}
                cells={vanillaCells}
                // NOTE: makes proceed() available on all controls as
                // ControlProps.config.proceed; this callback should only be
                // used when the screen does not present a form, i.e., does
                // not call handleChange().
                config={{
                  proceed,
                  setMessages,
                  reset,
                  theme,
                }}
                ajv={ajv}
                onChange={onChange}
              />
            </form>
          ) : (
            // @ts-ignore OKTA-471233
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <CircularLoadIndicator
                aria-label={t('loading.label')}
                aria-valuetext={t('loading.label')}
              />
            </Box>
          )
        }
      </AuthContent>
    </AuthContainer>
  );
};
