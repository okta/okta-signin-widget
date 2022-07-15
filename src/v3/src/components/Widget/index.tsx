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
  AuthenticatorKey,
  IdxMessage,
  IdxStatus,
  IdxTransaction,
} from '@okta/okta-auth-js';
import { FunctionComponent, h } from 'preact';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';

import { WidgetContextProvider } from '../../contexts';
import { usePolling } from '../../hooks';
import transformTransaction from '../../transformer/authJs';
import { transformTerminalTransaction, transformUnhandledErrors } from '../../transformer/terminal';
import { createForm } from '../../transformer/utils';
import {
  FormBag,
  MessageType,
  UISchemaLayout,
  WidgetProps,
} from '../../types';
import { getEventContext } from '../../util/getEventContext';
import { buildAuthCoinProps, isAndroidOrIOS, isAuthClientSet } from '../../util';
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

  const [data, setData] = useState({});
  const [messages, setMessages] = useState<IdxMessage[]>([]);
  const [idxTransaction, setIdxTransaction] = useState<IdxTransaction | undefined>();
  const [stepToRender, setStepToRender] = useState<string | undefined>(undefined);
  const prevIdxTransactionRef = useRef<IdxTransaction>();
  const [authApiError, setAuthApiError] = useState<AuthApiError>();
  const pollingTransaction = usePolling(idxTransaction, widgetProps, data);
  const dataSchemaRef = useRef<FormBag['dataSchema']>();

  // Derived value from idxTransaction
  const formBag = useMemo<FormBag>(() => {
    if (authApiError) {
      return transformUnhandledErrors(widgetProps, authApiError);
    }

    // cancelled transactions will be bootstrapped again, so we wait if that happens
    if (idxTransaction === undefined || idxTransaction?.status === IdxStatus.CANCELED) {
      return createForm();
    }

    if ([IdxStatus.TERMINAL, IdxStatus.SUCCESS].includes(idxTransaction.status)
        || !idxTransaction.nextStep) {
      return transformTerminalTransaction(idxTransaction, widgetProps);
    }

    let step = stepToRender;
    // Mobile devices cannot scan QR codes while navigating through flow
    // so we force them to select either email / sms for enrollment
    if (idxTransaction.context.currentAuthenticator?.value.key === AuthenticatorKey.OKTA_VERIFY
        && idxTransaction.nextStep.name === 'enroll-poll'
        && isAndroidOrIOS()) {
      step = 'select-enrollment-channel';
    }
    const bag = transformTransaction({
      transaction: idxTransaction,
      prevTransaction: prevIdxTransactionRef.current,
      step,
      widgetProps,
    });

    // Get data state ready before updating formBag
    setData(bag.data);

    return bag;
  }, [
    idxTransaction,
    authApiError,
    stepToRender,
    widgetProps,
  ]);

  // track previous idxTransaction
  useEffect(() => {
    prevIdxTransactionRef.current = idxTransaction;
  }, [idxTransaction]);

  // update dataSchemaRef in context
  useEffect(() => {
    dataSchemaRef.current = formBag.dataSchema;
  }, [formBag]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    events?.afterRender?.(getEventContext(idxTransaction));

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idxTransaction, setMessages, bootstrap]);

  // TODO: OKTA-517723 temporary override until odyssey-react-mui theme borderRadius value is fixed
  odysseyTheme.shape.borderRadius = 4;

  return (
    <WidgetContextProvider value={{
      authClient,
      widgetProps,
      onSuccessCallback: onSuccess,
      idxTransaction,
      setIdxTransaction,
      stepToRender,
      setStepToRender,
      setMessages,
      data,
      setData,
      dataSchemaRef,
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
                formBag.uischema.elements.length > 0
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
