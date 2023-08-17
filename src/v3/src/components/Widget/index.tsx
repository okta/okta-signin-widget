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

import './style.module.css';

import { ScopedCssBaseline } from '@mui/material';
import { MuiThemeProvider, OdysseyCacheProvider } from '@okta/odyssey-react-mui';
import {
  AuthApiError,
  AuthenticatorKey,
  IdxMessage,
  IdxStatus,
  IdxTransaction,
  OAuthError,
} from '@okta/okta-auth-js';
import { FunctionComponent, h } from 'preact';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';
import { mergeThemes } from 'src/util/mergeThemes';

import Bundles from '../../../../util/Bundles';
import { IDX_STEP } from '../../constants';
import { WidgetContextProvider } from '../../contexts';
import { useInteractionCodeFlow, usePolling, useStateHandle } from '../../hooks';
import { transformIdxTransaction } from '../../transformer';
import {
  transformTerminalTransaction,
  transformUnhandledErrors,
} from '../../transformer/terminal';
import { createForm } from '../../transformer/utils';
import {
  FormBag,
  MessageType,
  UISchemaLayout,
  UISchemaLayoutType,
  WidgetProps,
} from '../../types';
import {
  areTransactionsEqual,
  buildAuthCoinProps,
  getLanguageCode,
  getLanguageDirection,
  isAndroidOrIOS,
  isAuthClientSet,
  isOauth2Enabled,
  loadLanguage,
  SessionStorage,
} from '../../util';
import { getEventContext } from '../../util/getEventContext';
import { mapMuiThemeFromBrand } from '../../util/theme';
import AuthContainer from '../AuthContainer/AuthContainer';
import AuthContent from '../AuthContent/AuthContent';
import AuthHeader from '../AuthHeader/AuthHeader';
import ConsentHeader from '../ConsentHeader';
import Form from '../Form';
import IdentifierContainer from '../IdentifierContainer';
import Spinner from '../Spinner';

export const Widget: FunctionComponent<WidgetProps> = (widgetProps) => {
  if (!isAuthClientSet(widgetProps)) {
    throw new Error('authClient is required');
  }

  const {
    authClient,
    brandColors,
    brandName,
    cspNonce,
    events,
    muiThemeOverrides,
    logo,
    logoText,
    globalSuccessFn,
    globalErrorFn,
    proxyIdxResponse,
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
  const [responseError, setResponseError] = useState<AuthApiError | OAuthError | null>(null);
  const pollingTransaction = usePolling(idxTransaction, widgetProps, data);
  const interactionCodeFlowFormBag = useInteractionCodeFlow(
    idxTransaction,
    widgetProps,
    globalSuccessFn,
    globalErrorFn,
  );
  const dataSchemaRef = useRef<FormBag['dataSchema']>();
  const [loading, setLoading] = useState<boolean>(false);
  const [widgetRendered, setWidgetRendered] = useState<boolean>(false);
  const [loginHint, setloginHint] = useState<string | null>(null);
  const languageCode = getLanguageCode(widgetProps);
  const languageDirection = getLanguageDirection(languageCode);
  const { stateHandle, unsetStateHandle } = useStateHandle(widgetProps);

  // merge themes
  const theme = useMemo(() => mergeThemes(
    mapMuiThemeFromBrand(brandColors, languageDirection, muiThemeOverrides),
    {
      components: {
        MuiInputLabel: {
          styleOverrides: {
            root: () => ({
              wordBreak: 'break-word',
              whiteSpace: 'normal',
            }),
          },
        },
      },
    }
  ), [brandColors, languageDirection, muiThemeOverrides]);

  // on unmount, remove the language
  useEffect(() => () => {
    if (Bundles.isLoaded(languageCode)) {
      Bundles.remove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initLanguage = useCallback(async () => {
    if (!Bundles.isLoaded(languageCode)) {
      await loadLanguage(widgetProps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleError = (error: unknown) => {
    // TODO: handle error based on types
    // AuthApiError is one of the potential error that can be thrown here
    // We will want to expose development stage errors from auth-js and file jiras against it
    setResponseError(error as (AuthApiError | OAuthError));
    console.error(error);
    return null;
  };

  const bootstrap = useCallback(async () => {
    const usingStateHandleFromSession = stateHandle
      && stateHandle === SessionStorage.getStateHandle();
    await initLanguage();
    try {
      if (typeof proxyIdxResponse !== 'undefined') {
        setIdxTransaction({
          // @ts-expect-error OKTA-589168 - RawIdxResponse type does not contain the properties from ProxyIdxResponse type yet
          // remove ts-expect-error ASAP to avoid risk of trying to access property that does not exist
          rawIdxState: proxyIdxResponse,
          // @ts-expect-error OKTA-589168 - IdxContext type does not contain the properties from ProxyIdxResponse type yet
          // remove ts-expect-error ASAP to avoid risk of trying to access property that does not exist
          context: proxyIdxResponse,
        });
        return;
      }
      const transaction: IdxTransaction = await authClient.idx.start({
        stateHandle,
        // Required to prevent auth-js from clearing sessionStorage and breaking interaction code flow
        exchangeCodeForTokens: false,
      });
      const hasError = !transaction.requestDidSucceed || transaction.messages?.some(
        (msg) => msg.class === MessageType.ERROR.toString(),
      );
      if (hasError && usingStateHandleFromSession) {
        throw new Error('saved stateToken is invalid'); // will be caught in this function
      }

      setResponseError(null);
      setIdxTransaction(transaction);
      // ready event
      events?.ready?.({
        stepName: transaction.nextStep?.name,
      });
    } catch (error) {
      if (usingStateHandleFromSession) {
        // Saved stateHandle is invalid. Remove it from session
        // Bootstrap will be restarted with stateToken from widgetProps
        unsetStateHandle();
      } else {
        events?.ready?.();

        handleError(error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authClient, stateHandle, setIdxTransaction, setResponseError, initLanguage]);

  // Derived value from idxTransaction
  const formBag = useMemo<FormBag>(() => {
    if (responseError) {
      return transformUnhandledErrors(widgetProps, responseError);
    }

    if (idxTransaction === undefined) {
      return createForm();
    }

    // clear the loginHint value when returning to the identify flow
    if (idxTransaction?.nextStep?.name === IDX_STEP.IDENTIFY) {
      setloginHint(null);
    }

    if ([IdxStatus.TERMINAL, IdxStatus.SUCCESS].includes(idxTransaction.status)
      || idxTransaction.nextStep?.name === IDX_STEP.SKIP // force safe mode to be terminal
      || !idxTransaction.nextStep) {
      return transformTerminalTransaction(idxTransaction, widgetProps, bootstrap);
    }

    if (!isOauth2Enabled(widgetProps) && prevIdxTransactionRef.current) {
      // Do not save state handle for the first page loads.
      // Because there shall be no difference between following behavior
      // 1. bootstrap widget
      //    -> save state handle to session storage
      //    -> refresh page
      //    -> introspect using sessionStorage.stateHandle
      // 2. bootstrap widget
      //    -> do not save state handle to session storage
      //    -> refresh page
      //    -> introspect using options.stateHandle
      const prevStep = prevIdxTransactionRef.current?.nextStep?.name;
      // Do not save state handle if just removed due to canceling
      if (idxTransaction.status !== IdxStatus.CANCELED
        && prevStep !== IDX_STEP.CANCEL_TRANSACTION) {
        SessionStorage.setStateHandle(idxTransaction?.context?.stateHandle);
      }
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
      setMessage,
      isClientTransaction,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    idxTransaction,
    responseError,
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
        ...formBag.data,
        ...prev,
      }));
    } else {
      setData(formBag.data);
    }

    setUischema(formBag.uischema);
  }, [formBag, isClientTransaction]);

  const resume = useCallback(async () => {
    await initLanguage();
    try {
      if (typeof proxyIdxResponse !== 'undefined') {
        setIdxTransaction({
          // @ts-expect-error OKTA-589168 - RawIdxResponse type does not contain the properties from ProxyIdxResponse type yet
          // remove ts-expect-error ASAP to avoid risk of trying to access property that does not exist
          rawIdxState: proxyIdxResponse,
          // @ts-expect-error OKTA-589168 - IdxContext type does not contain the properties from ProxyIdxResponse type yet
          // remove ts-expect-error ASAP to avoid risk of trying to access property that does not exist
          context: proxyIdxResponse,
        });
        return;
      }
      const transaction = await authClient.idx.proceed({
        stateHandle: idxTransaction?.context.stateHandle,
      });

      setIdxTransaction(transaction);

      events?.ready?.({
        stepName: transaction.nextStep?.name,
      });
    } catch (error) {
      events?.ready?.();

      handleError(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authClient, setIdxTransaction, setResponseError, initLanguage]);

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
     * when that is the case, we need to check the authenticator key to
     * determine if they are the same (as you shouldn't be challenged with the same authenticator)
     * But if for some reason the keys are the same between them, we perform a last ditch check
     * against the current authenticator's ID, which should always be unique between challenges
    */
    if (!areTransactionsEqual(idxTransaction, pollingTransaction)) {
      setIdxTransaction(pollingTransaction);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingTransaction]); // only watch on pollingTransaction changes

  useEffect(() => {
    if (typeof interactionCodeFlowFormBag === 'undefined') {
      return;
    }

    setUischema(interactionCodeFlowFormBag.uischema);
  }, [interactionCodeFlowFormBag]);

  useEffect(() => {
    if (isClientTransaction) {
      return;
    }
    if (widgetRendered && typeof idxTransaction !== 'undefined'
      && uischema.elements.length > 0) {
      events?.afterRender?.(getEventContext(idxTransaction));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetRendered, idxTransaction]);

  useEffect(() => {
    if (responseError !== null) {
      events?.afterRender?.({
        controller: null,
        formName: 'terminal',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responseError]);

  return (
    <WidgetContextProvider value={{
      authClient,
      widgetProps,
      onSuccessCallback: globalSuccessFn,
      onErrorCallback: globalErrorFn,
      idxTransaction,
      setResponseError,
      setIdxTransaction,
      setIsClientTransaction,
      stepToRender,
      setStepToRender,
      message,
      setMessage,
      data,
      setData,
      dataSchemaRef,
      loading,
      setLoading,
      setWidgetRendered,
      loginHint,
      setloginHint,
      languageCode,
      languageDirection,
    }}
    >
      <OdysseyCacheProvider nonce={cspNonce}>
        <MuiThemeProvider theme={theme}>
          {/* the style is to allow the widget to inherit the parent's bg color */}
          <ScopedCssBaseline
            sx={{
              backgroundColor: 'inherit',
              'span.strong': {
                fontWeight: 'bold',
                wordBreak: 'break-all',
              },
            }}
          >
            <AuthContainer>
              <AuthHeader
                logo={logo}
                logoText={logoText}
                brandName={brandName}
                authCoinProps={buildAuthCoinProps(idxTransaction)}
              />
              <AuthContent>
                <ConsentHeader />
                <IdentifierContainer />
                {
                  uischema.elements.length > 0
                    ? <Form uischema={uischema as UISchemaLayout} />
                    : <Spinner />
                }
              </AuthContent>
            </AuthContainer>
          </ScopedCssBaseline>
        </MuiThemeProvider>
      </OdysseyCacheProvider>
    </WidgetContextProvider>
  );
};
