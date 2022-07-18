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

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { odysseyTheme } from '@okta/odyssey-react-mui';
import { ThemeProvider } from '@okta/odyssey-react-theme';
import {
  AuthApiError,
  IdxMessage,
  IdxStatus,
  IdxTransaction,
} from '@okta/okta-auth-js';
import { FunctionComponent, h } from 'preact';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'preact/hooks';

import { WidgetContextProvider } from '../../contexts';
import { usePolling } from '../../hooks';
import transformTransaction from '../../transformer/authJs';
import { transformTerminalTransaction, transformUnhandledErrors } from '../../transformer/terminal';
import {
  FormBag,
  IdxTransactionWithNextStep,
  MessageType,
  UISchemaLayout,
  Undefinable,
  WidgetProps,
} from '../../types';
import { buildAuthCoinProps, isAuthClientSet } from '../../util';
import { mapThemeFromBrand } from '../../util/theme';
import AuthContainer from '../AuthContainer/AuthContainer';
import AuthContent from '../AuthContent/AuthContent';
import AuthHeader from '../AuthHeader/AuthHeader';
import Form from '../Form';
import IdentifierContainer from '../IdentifierContainer/IdentifierContainer';
import InfoSection from '../InfoSection/InfoSection';
import Spinner from '../Spinner';

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
    events,
  } = widgetProps;

  const TERMINAL_STATUSES = [IdxStatus.TERMINAL, IdxStatus.SUCCESS];
  const [data, setData] = useState({});
  const [messages, setMessages] = useState<IdxMessage[]>([]);
  const [idxTransaction, setIdxTransaction] = useState<IdxTransaction | undefined>();
  const [authApiError, setAuthApiError] = useState<AuthApiError>();
  const pollingTransaction = usePolling(idxTransaction, widgetProps, data);
  const [stepperStepIndex, setStepperStepIndex] = useState<number>(0);

  // Derived value from idxTransaction
  const formBag = useMemo<Undefinable<FormBag>>(() => {
    if (authApiError) {
      return transformUnhandledErrors(widgetProps, authApiError);
    }

    // cancelled transactions will be bootstrapped again, so we wait if that happens
    if (idxTransaction === undefined || idxTransaction?.status === IdxStatus.CANCELED) {
      return undefined;
    }

    if (TERMINAL_STATUSES.includes(idxTransaction.status) || !idxTransaction.nextStep) {
      return transformTerminalTransaction(idxTransaction, widgetProps);
    }

    const bag = transformTransaction(idxTransaction as IdxTransactionWithNextStep, widgetProps);
    // Get data state ready before updating formBag
    setData(bag.data);
    return bag;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idxTransaction, authApiError]);

  const handleError = (error: unknown) => {
    // TODO: handle error based on types
    // AuthApiError is one of the potential error that can be thrown here
    // We will want to expose development stage errors from auth-js and file jiras against it
    setAuthApiError(error as AuthApiError);
    console.error(error);
    // error event
    events?.afterError?.({
      stepName: idxTransaction?.nextStep?.name,
    }, error);
    return null;
  };

  const bootstrap = useCallback(async () => {
    try {
      const transaction = await authClient.idx.start({
        stateHandle: stateToken,
      });

      setIdxTransaction(transaction);

      // ready event
      events?.ready?.({
        stepName: transaction.nextStep?.name,
      });
    } catch (error) {
      handleError(error);
    }
  }, [authClient, stateToken, setIdxTransaction, setAuthApiError]);

  const resume = useCallback(async () => {
    try {
      const transaction = await authClient.idx.proceed({
        stateHandle: idxTransaction?.context.stateHandle,
      });

      setIdxTransaction(transaction);
    } catch (error) {
      handleError(error);
    }
  }, [authClient, setIdxTransaction, setAuthApiError]);

  // bootstrap / resume the widget
  useEffect(() => {
    if (authClient.idx.canProceed()) {
      resume();
    } else {
      bootstrap();
    }
  }, [authClient, setIdxTransaction, bootstrap, resume]);

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

    const { messages: newMessages = [], status } = idxTransaction;

    events?.afterRender?.({
      stepName: idxTransaction.nextStep?.name,
      authenticatorKey: idxTransaction.nextStep?.relatesTo?.value?.key,
    });

    // for multiple error messages
    newMessages?.forEach((newMessage) => {
      const { class: type, message } = newMessage;
      if (type === MessageType.ERROR) {
        // error event
        events?.afterError?.({
          stepName: idxTransaction?.nextStep?.name,
        }, { message });
      }
    });

    // set form level messages
    setMessages(newMessages);

    // clear idxTransaction to start loading state
    if (status === IdxStatus.CANCELED) {
      setIdxTransaction(undefined);
      bootstrap();
    }
  }, [idxTransaction, setMessages, bootstrap]);

  return (
    <WidgetContextProvider value={{
      authClient,
      widgetProps,
      onSuccessCallback: onSuccess,
      idxTransaction,
      setIdxTransaction,
      setMessages,
      data,
      setData,
      stepperStepIndex,
      setStepperStepIndex,
      formBag,
    }}
    >
      {/* Note that we need two theme providers until we fully migrate to odyssey-mui */}
      <MuiThemeProvider theme={odysseyTheme}>
        <ThemeProvider theme={mapThemeFromBrand(brandColors)}>
          <AuthContainer>
            <AuthHeader
              logo={logo}
              logoText={logoText}
              brandName={brandName}
              authCoinProps={buildAuthCoinProps(idxTransaction)}
            />
            <AuthContent>
              <IdentifierContainer />
              <InfoSection messages={messages} />
              {
                formBag
                  ? <Form uischema={formBag.uischema as UISchemaLayout} />
                  : <Spinner />
              }
            </AuthContent>
          </AuthContainer>
        </ThemeProvider>
      </MuiThemeProvider>
    </WidgetContextProvider>
  );
};
