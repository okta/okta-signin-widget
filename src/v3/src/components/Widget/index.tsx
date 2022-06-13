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
import { ThemeProvider } from '@okta/odyssey-react-theme';
import {
  APIError,
  IdxMessage,
  IdxStatus,
  IdxTransaction,
} from '@okta/okta-auth-js';
import Ajv, { ErrorObject } from 'ajv';
import AjvErrors from 'ajv-errors';
import debounce from 'lodash/debounce';
import { FunctionComponent, h } from 'preact';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'preact/hooks';
import {
  FormBag,
  IdxTransactionWithNextStep,
  Nullish,
  Undefinable,
} from 'src/types/jsonforms';
import { WidgetProps } from 'src/types/widget';

import { WidgetContextProvider } from '../../contexts';
import { usePolling } from '../../hooks';
import transformTransaction from '../../transformer/authJs';
import { transformTerminalTransaction, transformUnhandledErrors } from '../../transformer/terminal';
import { buildAuthCoinProps, buildPayload, isAuthClientSet } from '../../util';
import { mapThemeFromBrand } from '../../util/theme';
import AuthContainer from '../AuthContainer/AuthContainer';
import AuthContent from '../AuthContent/AuthContent';
import AuthHeader from '../AuthHeader/AuthHeader';
import InfoSection from '../InfoSection/InfoSection';
import { renderers } from '../renderers';
import Spinner from '../Spinner';

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

export const Widget: FunctionComponent<WidgetProps> = (widgetProps) => {
  if (!isAuthClientSet(widgetProps)) {
    throw new Error('authClient is required');
  }

  const {
    authClient,
    brandColors,
    brandName,
    logo,
    logoText,
    onSuccess,
    stateToken,
  } = widgetProps;

  const TERMINAL_STATUSES = [IdxStatus.TERMINAL, IdxStatus.SUCCESS];

  const [data, setData] = useState({});
  // TODO OKTA-462462 upgrade to JSONForms@3.x
  // TODO OKTA-432181 custom client-side error messages
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formErrors, setFormErrors] = useState<ErrorObject[]>([]);
  const [messages, setMessages] = useState<IdxMessage[]>([]);
  const [idxTransaction, setIdxTransaction] = useState<Nullish<IdxTransaction>>();
  const [authApiError, setAuthApiError] = useState<Undefinable<APIError>>();
  const pollingTransaction = usePolling(idxTransaction);

  const bootstrap = useCallback(async () => {
    const transaction = await authClient.idx.start({
      stateHandle: stateToken,
    }).catch((error) => {
      // TODO: handle error based on types
      // AuthApiError is one of the potential error that can be thrown here
      // We will want to expose development stage errors from auth-js and file jiras against it
      setAuthApiError(error);
      console.error(error);
      return null;
    });
    setIdxTransaction(transaction);
  }, [authClient, stateToken, setIdxTransaction]);

  const resume = useCallback(async () => {
    const transaction = await authClient.idx.proceed({
      stateHandle: idxTransaction?.context.stateHandle,
    })
      .catch((error) => {
        setAuthApiError(error);
        console.error(error);
        return null;
      });
    setIdxTransaction(transaction);
  }, [authClient, setIdxTransaction]);

  // bootstrap / resume the widget
  // TODO: follow widget implementation to handle redirect bootstrap scenarios
  useEffect(() => {
    if (authClient.idx.canProceed()) {
      resume();
    } else {
      bootstrap();
    }
  }, [authClient, setIdxTransaction, bootstrap, resume]);

  // Derived value from idxTransaction
  const formBag = useMemo<Undefinable<FormBag>>(() => {
    // cancelled transactions will be bootstrapped again, so we wait if that happens
    if (idxTransaction === undefined || idxTransaction?.status === IdxStatus.CANCELED) {
      return undefined;
    }

    // null indicates uncaught error
    if (idxTransaction === null) {
      return transformUnhandledErrors(authApiError);
    }

    if (TERMINAL_STATUSES.includes(idxTransaction.status) || !idxTransaction.nextStep) {
      return transformTerminalTransaction(idxTransaction, widgetProps);
    }

    return transformTransaction(idxTransaction as IdxTransactionWithNextStep, widgetProps);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idxTransaction]);

  // For fixing screen
  const delay = useCallback(debounce((event) => {
    setFormErrors(event.errors || []);
    setData(event.data);
  }, 100), [setFormErrors, setData]);

  const onChange = (event: Pick<JsonFormsCore, 'data' | 'errors'>) => {
    delay(event);
  };

  const handleSubmit = useCallback(async (e: any) => {
    e.preventDefault();

    // discard submission action when form is not available
    if (!formBag || !idxTransaction) {
      return;
    }

    // TODO: disable action buttons after click

    const { nextStep: { action } = {} } = idxTransaction;
    const payload = buildPayload(formBag, data);
    // Per SDK team action is guranteed to exist here, so we are safe to assert non-null
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const transaction = await action!({
      ...payload,
      stateHandle: idxTransaction?.context.stateHandle,
    })
      .catch((error) => {
        setAuthApiError(error);
        console.error(error);
        return null;
      });
    setIdxTransaction(transaction);
  }, [data, formBag, idxTransaction, setIdxTransaction]);

  // Update idxTransaction when new status comes back from polling
  useEffect(() => {
    if (!idxTransaction || !pollingTransaction) {
      return;
    }

    if (pollingTransaction.nextStep?.name !== idxTransaction.nextStep?.name) {
      setIdxTransaction(pollingTransaction);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pollingTransaction, // only watch on pollingTransaction changes
  ]);

  useEffect(() => {
    if (!idxTransaction) {
      return;
    }

    // reset form data when a new transaction is available
    setData({});

    const { messages: newMessages, status } = idxTransaction;
    switch (status) {
      case (IdxStatus.PENDING): {
        // Handle global errors or warnings
        if (newMessages) {
          setMessages(newMessages);
        }
        break;
      }
      case (IdxStatus.SUCCESS):
      case (IdxStatus.TERMINAL): {
        break;
      }
      case (IdxStatus.CANCELED): {
        // clear idxTransaction to start loading state
        setIdxTransaction(undefined);
        bootstrap();
        break;
      }
      default: {
        if (newMessages) {
          // Set error.
          setMessages(newMessages);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idxTransaction, setMessages, bootstrap]);

  return (
    <WidgetContextProvider value={{
      authClient,
      data,
      formBag,
      onSuccessCallback: onSuccess,
      setIdxTransaction,
      setMessages,
      transaction: idxTransaction,
    }}
    >
      <ThemeProvider theme={mapThemeFromBrand(brandColors)}>
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
              formBag ? (
                // TODO: add form onSubmit handler and assign buttons proper types
                <form
                  noValidate
                  onSubmit={handleSubmit}
                >
                  <JsonForms
                    schema={formBag.schema}
                    uischema={formBag.uischema}
                    data={data}
                    renderers={renderers}
                    cells={vanillaCells}
                    // disable client side validation to pass parity stage testing
                    validationMode="NoValidation"
                    ajv={ajv}
                    onChange={onChange}
                  />
                </form>
              ) : <Spinner />
            }
          </AuthContent>
        </AuthContainer>
      </ThemeProvider>
    </WidgetContextProvider>
  );
};
