/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { AuthSdkError, IdxStatus, IdxTransaction } from '@okta/okta-auth-js';
import { useEffect, useState } from 'preact/hooks';

import { RenderResult } from '../../../types';
import { getTypedOAuthError, RecoverableError } from '../../../util/OAuthErrors';
import { redirectTransformer } from '../transformer/redirect';
import { FormBag, WidgetProps } from '../types';
import {
  getMode, isAuthClientSet, isOauth2Enabled, SessionStorage,
} from '../util';

export const useInteractionCodeFlow = (
  transaction: IdxTransaction | undefined,
  widgetProps: WidgetProps,
  onSuccess?: WidgetProps['globalSuccessFn'],
  onError?: WidgetProps['globalErrorFn'],
): FormBag | undefined => {
  const [formBag, setFormBag] = useState<FormBag | undefined>();

  if (!isAuthClientSet(widgetProps)) {
    throw new Error('authClient is required');
  }

  useEffect(() => {
    if (typeof transaction === 'undefined') {
      setFormBag(undefined);
      return;
    }

    if (!([IdxStatus.TERMINAL, IdxStatus.SUCCESS].includes(transaction.status)
        || !transaction.nextStep)) {
      setFormBag(undefined);
      return;
    }

    if (!(isOauth2Enabled(widgetProps) && transaction.interactionCode)) {
      setFormBag(undefined);
      return;
    }
    SessionStorage.removeStateHandle();

    const {
      authClient,
      redirectUri,
      redirect,
    } = widgetProps;
    const { interactionCode } = transaction;
    const transactionMeta = authClient.idx.getSavedTransactionMeta();
    const state = authClient.options.state || transactionMeta?.state;
    const redirectParams = { interaction_code: interactionCode || '', state: state || '' };

    const isRemediationMode = getMode(widgetProps) === 'remediation';
    if (isRemediationMode) {
      authClient.idx.clearTransactionMeta();
    }

    const shouldRedirect = redirect === 'always';
    if (shouldRedirect) {
      if (!redirectUri) {
        throw new Error('redirectUri is required');
      }

      const searchParams = new URLSearchParams(redirectParams);
      const redirectFormBag = redirectTransformer(
        transaction,
        `${redirectUri}?${searchParams.toString()}`,
        widgetProps,
      );
      setFormBag(redirectFormBag);
    }

    if (isRemediationMode) {
      onSuccess?.({
        status: IdxStatus.SUCCESS,
        ...redirectParams,
      });
      setFormBag(undefined);
      return;
    }

    // Operating in "relying-party" mode. The widget owns this transaction.
    // Complete the transaction client-side and call success/resolve promise
    if (!transactionMeta) {
      throw new Error('Could not load transaction data from storage');
    }

    const { codeVerifier } = transactionMeta;
    const exchangeCodeForTokens = async () => {
      await authClient.token.exchangeCodeForTokens({ codeVerifier, interactionCode })
        .then(({ tokens }) => {
          const result: RenderResult = { tokens, status: IdxStatus.SUCCESS };
          onSuccess?.(result);
        })
        .catch((error: AuthSdkError) => {
          const typedError = getTypedOAuthError(error);
          if (typedError instanceof RecoverableError && typedError.is('terminal')) {
            throw typedError;
          }
          onError?.(typedError);
        })
        .finally(() => authClient.idx.clearTransactionMeta());
      setFormBag(undefined);
    };
    exchangeCodeForTokens();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction, widgetProps]);

  return formBag;
};
