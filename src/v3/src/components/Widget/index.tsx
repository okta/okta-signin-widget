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

// NOTE: Do not remove this import of style.css!
// We need to emit a CSS file, even if it's empty, to prevent a 404 on the Okta-hosted login page.
import './style.css';

import { ScopedCssBaseline } from '@mui/material';
import { MuiThemeProvider } from '@okta/odyssey-react-mui';
import {
  AuthApiError,
  AuthenticatorKey,
  IdxMessage,
  IdxStatus,
  IdxTransaction,
  OAuthError,
} from '@okta/okta-auth-js';
import { ErrorObject } from 'ajv';
import { Fragment, FunctionComponent, h } from 'preact';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';
import { mergeThemes } from 'src/util/mergeThemes';

import Bundles from '../../../../util/Bundles';
import { IDX_STEP, SUPPORTED_SERVER_GENERATED_SCHEMA_REMEDIATIONS, UI_SCHEMA_SUPPORT_HEADER_KEY } from '../../constants';
import { WidgetContextProvider } from '../../contexts';
import {
  useInteractionCodeFlow,
  useOnce,
  usePolling,
  useStateHandle,
} from '../../hooks';
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
  canBootstrapWidget,
  extractPageTitle,
  getLanguageCode,
  getLanguageDirection,
  isAndroidOrIOS,
  isAuthClientSet,
  isConfigRegisterFlow,
  isConsentStep,
  isOauth2Enabled,
  isServerGeneratedSchemaAvailable,
  loadLanguage,
  SessionStorage,
  triggerEmailVerifyCallback,
} from '../../util';
import { getEventContext } from '../../util/getEventContext';
import { createTheme } from '../../util/theme';
import AuthContainer from '../AuthContainer/AuthContainer';
import AuthContent from '../AuthContent/AuthContent';
import AuthHeader from '../AuthHeader/AuthHeader';
import ConsentHeader from '../ConsentHeader';
import CustomPluginsOdysseyCacheProvider from '../CustomPluginsOdysseyCacheProvider';
import Form from '../Form';
import JsonForms from '../Form/jsonforms/Form';
import Spinner from '../Spinner';
import GlobalStyles from './GlobalStyles';

export const Widget: FunctionComponent<WidgetProps> = (widgetProps) => {
  if (!isAuthClientSet(widgetProps)) {
    throw new Error('authClient is required');
  }

  const {
    authClient,
    brandColors,
    brandName,
    cspNonce,
    theme: customTheme,
    logo,
    logoText,
    globalSuccessFn,
    globalErrorFn,
    proxyIdxResponse,
    eventEmitter,
    otp,
    flow,
    widgetHooks,
  } = widgetProps;

  const [hide, setHide] = useState<boolean>(false);
  const [data, setData] = useState<FormBag['data']>({});
  const [uischema, setUischema] = useState<FormBag['uischema']>({
    type: UISchemaLayoutType.VERTICAL,
    elements: [],
  });
  const [schema, setSchema] = useState<FormBag['schema'] | undefined>();
  const [message, setMessage] = useState<IdxMessage | undefined>();
  const [formErrors, setFormErrors] = useState<ErrorObject[]>([]);
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
  const widgetRenderedOnce = useRef<boolean>(false);
  const [loginHint, setloginHint] = useState<string | null>(null);
  const languageCode = getLanguageCode(widgetProps);
  const languageDirection = getLanguageDirection(languageCode);
  const { stateHandle, unsetStateHandle } = useStateHandle(widgetProps);

  // merge themes
  const theme = useMemo(() => mergeThemes(
    createTheme(brandColors, customTheme?.tokens ?? {}),
    { direction: languageDirection },
  ), [brandColors, customTheme, languageDirection]);

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

  const handleError = async (error: unknown) => {
    await widgetHooks.callHooks('before', undefined);
    // TODO: handle error based on types
    // AuthApiError is one of the potential error that can be thrown here
    // We will want to expose development stage errors from auth-js and file jiras against it
    setResponseError(error as (AuthApiError | OAuthError));
    console.error(error);
    return null;
  };

  const shouldRedirectToEnrollFlow = (transaction: IdxTransaction): boolean => {
    const { nextStep, neededToProceed } = transaction;
    if (!isConfigRegisterFlow(flow) || nextStep?.name !== IDX_STEP.IDENTIFY) {
      return false;
    }
    const isRegistrationEnabled = neededToProceed
      .find((remediation) => remediation.name === IDX_STEP.SELECT_ENROLL_PROFILE) !== undefined;

    if (!isRegistrationEnabled) {
      throw new Error('flow param error: No remediation can match current flow, check policy settings in your org.');
    }
    return true;
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
      // If widget is passed 'otp' config option, proceed with email verify callback
      if (otp) {
        setIdxTransaction(await triggerEmailVerifyCallback(widgetProps));
        return;
      }
      let transaction: IdxTransaction = await authClient.idx.start({
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

      // TODO
      // OKTA-651781
      // bootstrap into enroll flow when flow param is set to signup
      if (shouldRedirectToEnrollFlow(transaction)) {
        transaction = await authClient.idx.proceed({
          stateHandle: transaction?.context.stateHandle,
          step: IDX_STEP.SELECT_ENROLL_PROFILE,
        });
      }

      await widgetHooks.callHooks('before', transaction);

      setResponseError(null);
      setIdxTransaction(transaction);
    } catch (error) {
      if (usingStateHandleFromSession) {
        // Saved stateHandle is invalid. Remove it from session
        // Bootstrap will be restarted with stateToken from widgetProps
        unsetStateHandle();
      } else {
        await handleError(error);
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
    // clear the resend reminder time stamp in session storage if current transaction does not have resend option
    if (idxTransaction && !idxTransaction.nextStep?.canResend) {
      SessionStorage.removeResendTimestamp();
    }
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
    setSchema(formBag.schema);
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
      // If widget is passed 'otp' config option, proceed with email verify callback
      if (otp) {
        setIdxTransaction(await triggerEmailVerifyCallback(widgetProps));
        return;
      }
      let transaction = await authClient.idx.proceed({
        stateHandle: idxTransaction?.context.stateHandle,
      });

      // TODO
      // OKTA-651781
      if (shouldRedirectToEnrollFlow(transaction)) {
        transaction = await authClient.idx.proceed({
          stateHandle: transaction?.context.stateHandle,
          step: IDX_STEP.SELECT_ENROLL_PROFILE,
        });
      }

      await widgetHooks.callHooks('before', transaction);

      setIdxTransaction(transaction);
    } catch (error) {
      await handleError(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authClient, setIdxTransaction, setResponseError, initLanguage]);

  // bootstrap / resume the widget
  useEffect(() => {
    if (!canBootstrapWidget({
      authClient, stateHandle, setIdxTransaction, setResponseError,
    })) {
      return;
    }
    authClient.http.setRequestHeader(
      UI_SCHEMA_SUPPORT_HEADER_KEY,
      SUPPORTED_SERVER_GENERATED_SCHEMA_REMEDIATIONS.toString(),
    );
    if (authClient.idx.canProceed()) {
      resume();
    } else {
      bootstrap();
    }
  }, [authClient, setIdxTransaction, bootstrap, resume, stateHandle]);

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
    const asyncEffect = async () => {
      if (isClientTransaction) {
        return;
      }
      if (widgetRendered) {
        const executeAfterHooks = () => {
          if (uischema.elements.length > 0) {
            // Don't execute hooks in the end of authentication flow
            widgetHooks.callHooks('after', responseError ? undefined : idxTransaction);
          }
        };
        const emitAfterRender = () => {
          if (uischema.elements.length > 0) {
            // Don't emit events in the end of authentication flow
            eventEmitter.emit('afterRender', getEventContext(idxTransaction));
          }
        };
        const emitReady = () => eventEmitter.emit('ready', getEventContext(idxTransaction));

        // Keep the order of events and hooks as in Gen2
        if (!widgetRenderedOnce.current) {
          await executeAfterHooks();
          emitReady();
          emitAfterRender();
          widgetRenderedOnce.current = true;
        } else {
          emitAfterRender();
          await executeAfterHooks();
        }
      }
    };
    asyncEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetRendered, idxTransaction]);

  // listen to 'hide' event
  const toggleVisibility = useCallback((hideValue: boolean) => {
    setHide(hideValue);
  }, []);

  useOnce(() => {
    eventEmitter.on('hide', toggleVisibility);
  });
  useEffect(() => () => {
    eventEmitter.off('hide', toggleVisibility);
  }, [eventEmitter, toggleVisibility]);

  const getDocumentTitle = useCallback(() => (
    extractPageTitle(formBag.uischema, widgetProps, idxTransaction)
  ), [idxTransaction, widgetProps, formBag.uischema]);

  useEffect(() => {
    const title = getDocumentTitle();
    if (title !== null) {
      document.title = title;
    }
  }, [getDocumentTitle]);

  const renderForm = () => {
    if (uischema.elements.length === 0 || typeof idxTransaction === 'undefined') {
      return <Spinner />;
    }
    const useServerUISchema = isServerGeneratedSchemaAvailable(widgetProps, idxTransaction);
    if (useServerUISchema) {
      return typeof schema !== 'undefined' ? (
        <JsonForms
          schema={schema}
          uischema={uischema}
        />
      ) : <Spinner />;
    }

    return (
      <Fragment>
        <AuthHeader
          logo={logo}
          logoText={logoText}
          brandName={brandName}
          authCoinProps={buildAuthCoinProps(idxTransaction)}
        />
        <AuthContent>
          {isConsentStep(idxTransaction) && <ConsentHeader />}
          {
            uischema.elements.length > 0
              ? <Form uischema={uischema as UISchemaLayout} />
              : <Spinner />
          }
        </AuthContent>
      </Fragment>
    );
  };

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
      setFormErrors,
      formErrors,
    }}
    >
      <CustomPluginsOdysseyCacheProvider nonce={cspNonce}>
        <MuiThemeProvider theme={theme}>
          <GlobalStyles />
          {/* the style is to allow the widget to inherit the parent's bg color */}
          <ScopedCssBaseline sx={{ backgroundColor: 'inherit' }}>
            <AuthContainer hide={hide}>
              {renderForm()}
            </AuthContainer>
          </ScopedCssBaseline>
        </MuiThemeProvider>
      </CustomPluginsOdysseyCacheProvider>
    </WidgetContextProvider>
  );
};
