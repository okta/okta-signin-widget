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

import { ScopedCssBaseline } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider } from '@okta/odyssey-react-theme';
import {
  AuthApiError,
  AuthenticatorKey,
  IdxMessage,
  IdxStatus,
  IdxTransaction,
} from '@okta/okta-auth-js';
import isEqual from 'lodash/isEqual';
import { FunctionComponent, h } from 'preact';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';

import Bundles from '../../../../util/Bundles';
import { WidgetContextProvider } from '../../contexts';
import { usePolling } from '../../hooks';
import { transformIdxTransaction } from '../../transformer';
import { transformTerminalTransaction, transformUnhandledErrors } from '../../transformer/terminal';
import { createForm } from '../../transformer/utils';
import {
  FormBag,
  MessageType,
  UISchemaLayout,
  UISchemaLayoutType,
  WidgetProps,
} from '../../types';
import {
  buildAuthCoinProps,
  getAuthenticatorKey,
  getLanguageCode,
  isAndroidOrIOS,
  isAuthClientSet,
  loadLanguage,
} from '../../util';
import { getEventContext } from '../../util/getEventContext';
import { mapMuiThemeFromBrand, mapThemeFromBrand } from '../../util/theme';
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

  const [data, setData] = useState<FormBag['data']>({});
  const [uischema, setUischema] = useState<FormBag['uischema']>({
    type: UISchemaLayoutType.VERTICAL,
    elements: [],
  });
  const [message, setMessage] = useState<IdxMessage | undefined>();
  const [idxTransaction, setIdxTransaction] = useState<IdxTransaction | undefined>();
  const [isClientTransaction, setIsClientTransaction] = useState<boolean>(false);
  const [stepToRender, setStepToRender] = useState<string | undefined>(undefined);
  const prevIdxTransactionRef = useRef<IdxTransaction>();
  const [authApiError, setAuthApiError] = useState<AuthApiError | null>(null);
  const pollingTransaction = usePolling(idxTransaction, widgetProps, data);
  const dataSchemaRef = useRef<FormBag['dataSchema']>();

  useEffect(() => {
    // If we need to load a language (or apply custom i18n overrides), do
    // this now and re-run render after it's finished.
    if (!Bundles.isLoaded(getLanguageCode(widgetProps))) {
      (async () => {
        await loadLanguage(widgetProps);
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      setAuthApiError(null);
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
      return transformTerminalTransaction(idxTransaction, widgetProps, bootstrap);
    }

    let step = stepToRender || idxTransaction.nextStep.name;
    // Mobile devices cannot scan QR codes while navigating through flow
    // so we force them to select either email / sms for enrollment
    if (idxTransaction.context.currentAuthenticator?.value.key === AuthenticatorKey.OKTA_VERIFY
        && idxTransaction.nextStep.name === 'enroll-poll'
        && isAndroidOrIOS()) {
      step = 'select-enrollment-channel';
    }
    return transformIdxTransaction({
      transaction: idxTransaction,
      prevTransaction: prevIdxTransactionRef.current,
      step,
      widgetProps,
      isClientTransaction,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    idxTransaction,
    authApiError,
    stepToRender,
    widgetProps,
    bootstrap,
  ]);

  // track previous idxTransaction
  useEffect(() => {
    prevIdxTransactionRef.current = idxTransaction;
  }, [idxTransaction]);

  // update dataSchemaRef in context
  useEffect(() => {
    dataSchemaRef.current = formBag.dataSchema;
    if (isClientTransaction) {
      setData((prev) => ({
        ...prev,
        ...formBag.data,
      }));
    } else {
      setData(formBag.data);
    }

    setUischema(formBag.uischema);
  }, [formBag, isClientTransaction]);

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

    /**
     * polling transaction name can sometimes be the same as the current transaction's name
     * i.e. unlocking an account and immeidiately being challenged with a different authenticator
     * when that is the case, we need to compare inputs to determine if it is the same transaction
     * lastly, inputs could also be the same (i.e. email otp to password) in that case we finally
     * check the authenticator key to determine if they are the same
     * (as you shouldnt be challenged with the same authenticator)
    */
    if (pollingTransaction.nextStep?.name !== idxTransaction.nextStep?.name
        || !isEqual(pollingTransaction.nextStep?.inputs, idxTransaction.nextStep?.inputs)
        || getAuthenticatorKey(pollingTransaction) !== getAuthenticatorKey(idxTransaction)) {
      setIdxTransaction(pollingTransaction);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingTransaction]); // only watch on pollingTransaction changes

  useEffect(() => {
    if (!idxTransaction) {
      return;
    }

    const { messages: newMessages = [], status } = idxTransaction;

    events?.afterRender?.(getEventContext(idxTransaction));

    // for multiple error messages
    newMessages?.forEach((newMessage) => {
      const { class: type, message: msg } = newMessage;
      if (type === MessageType.ERROR) {
        // error event
        events?.afterError?.({
          stepName: idxTransaction?.nextStep?.name,
        }, { message: msg });
      }
    });

    // clear idxTransaction to start loading state
    if (status === IdxStatus.CANCELED) {
      setIdxTransaction(undefined);
      bootstrap();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idxTransaction, bootstrap]);

  return (
    <WidgetContextProvider value={{
      authClient,
      widgetProps,
      onSuccessCallback: onSuccess,
      idxTransaction,
      setAuthApiError,
      setIdxTransaction,
      setIsClientTransaction,
      stepToRender,
      setStepToRender,
      setMessage,
      data,
      setData,
      dataSchemaRef,
    }}
    >
      {/* Note that we need two theme providers until we fully migrate to odyssey-mui */}
      <MuiThemeProvider theme={mapMuiThemeFromBrand(brandColors)}>
        <ScopedCssBaseline>
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
                <InfoSection message={message} />
                {
                  uischema.elements.length > 0
                    ? <Form uischema={uischema as UISchemaLayout} />
                    : <Spinner />
                }
              </AuthContent>
            </AuthContainer>
          </ThemeProvider>
        </ScopedCssBaseline>
      </MuiThemeProvider>
    </WidgetContextProvider>
  );
};
