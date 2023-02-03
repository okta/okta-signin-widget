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
import {
  MuiThemeProvider as OdysseyMuiThemeProvider,
  OdysseyCacheProvider,
} from '@okta/odyssey-react-mui';
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

import Bundles from '../../../../util/Bundles';
import { IDX_STEP } from '../../constants';
import { WidgetContextProvider } from '../../contexts';
import { usePolling } from '../../hooks';
import { transformIdxTransaction } from '../../transformer';
import {
  transformTerminalTransaction,
  transformUnhandledErrors,
} from '../../transformer/terminal';
import { createForm } from '../../transformer/utils';
import {
  FormBag,
  UISchemaLayout,
  UISchemaLayoutType,
  WidgetProps,
} from '../../types';
import {
  areTransactionsEqual,
  buildAuthCoinProps,
  getLanguageCode,
  isAndroidOrIOS,
  isAuthClientSet,
  loadLanguage,
} from '../../util';
import { getEventContext } from '../../util/getEventContext';
import { mapMuiThemeFromBrand } from '../../util/theme';
import AuthContainer from '../AuthContainer/AuthContainer';
import AuthContent from '../AuthContent/AuthContent';
import AuthHeader from '../AuthHeader/AuthHeader';
import Form from '../Form';
import IdentifierContainer from '../IdentifierContainer/IdentifierContainer';
import Spinner from '../Spinner';

export const Widget: FunctionComponent<WidgetProps> = (widgetProps) => {
  if (!isAuthClientSet(widgetProps)) {
    throw new Error('authClient is required');
  }

  const {
    authClient,
    brandColors,
    brandName,
    events,
    muiThemeOverrides,
    logo,
    logoText,
    onSuccess,
    stateToken,
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
  const dataSchemaRef = useRef<FormBag['dataSchema']>();
  const [loading, setLoading] = useState<boolean>(false);
  const [widgetRendered, setWidgetRendered] = useState<boolean>(false);
  const [loginHint, setloginHint] = useState<string | null>(null);
  const brandedTheme = mapMuiThemeFromBrand(brandColors, muiThemeOverrides);

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
    setResponseError(error as (AuthApiError | OAuthError));
    console.error(error);
    return null;
  };

  const bootstrap = useCallback(async () => {
    try {
      const transaction = await authClient.idx.start({
        stateHandle: stateToken,
      });

      setResponseError(null);
      setIdxTransaction(transaction);
      // ready event
      events?.ready?.({
        stepName: transaction.nextStep?.name,
      });
    } catch (error) {
      events?.ready?.();

      handleError(error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authClient, stateToken, setIdxTransaction, setResponseError]);

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
    try {
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
  }, [authClient, setIdxTransaction, setResponseError]);

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
    if (isClientTransaction) {
      return;
    }
    if (widgetRendered && typeof idxTransaction !== 'undefined') {
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
      onSuccessCallback: onSuccess,
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
    }}
    >
      {/* Note: we need to keep both themeproviders (MUI/ODS) until ODS exports all MUI components */}
      <MuiThemeProvider theme={brandedTheme}>
        {/* the style is to allow the widget to inherit the parent's bg color */}
        <ScopedCssBaseline sx={{ backgroundColor: 'inherit' }}>
          <OdysseyCacheProvider>
            <OdysseyMuiThemeProvider theme={brandedTheme}>
              <AuthContainer>
                <AuthHeader
                  logo={logo}
                  logoText={logoText}
                  brandName={brandName}
                  authCoinProps={buildAuthCoinProps(idxTransaction)}
                />
                <AuthContent>
                  <IdentifierContainer />
                  {
                    uischema.elements.length > 0
                      ? <Form uischema={uischema as UISchemaLayout} />
                      : <Spinner />
                  }
                </AuthContent>
              </AuthContainer>
            </OdysseyMuiThemeProvider>
          </OdysseyCacheProvider>
        </ScopedCssBaseline>
      </MuiThemeProvider>
    </WidgetContextProvider>
  );
};
