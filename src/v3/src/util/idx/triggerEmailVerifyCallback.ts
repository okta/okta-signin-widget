/*
 * Copyright (c) 2025-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import {
  IdxMessages, IdxStatus, IdxTransaction, ProceedOptions,
} from '@okta/okta-auth-js';

import { WidgetProps } from '../../types';
import { isAuthClientSet } from '../widgetUtils';

export const triggerEmailVerifyCallback = async (props: WidgetProps): Promise<IdxTransaction> => {
  if (!isAuthClientSet(props)) {
    throw new Error('authClient is required');
  }

  const { authClient, otp } = props;
  const idxOptions: ProceedOptions = {
    exchangeCodeForTokens: false,
  };
  const meta = await authClient.idx.getSavedTransactionMeta(); // meta can load in another tab using state if it matches

  if (!meta || !meta.interactionHandle) {
    // Flow can not continue in this tab. Create a synthetic server response and use it to display a message to the user
    const messages: IdxMessages = {
      type: 'array',
      value: [
        {
          message: 'Enter the OTP in your original authentication location.',
          i18n: {
            key: 'idx.enter.otp.in.original.tab',
          },
          class: 'INFO',
        },
      ],
    };

    const syntheticTransaction: IdxTransaction = {
      status: IdxStatus.TERMINAL,
      messages: messages.value,
      // @ts-expect-error
      rawIdxState: {
        messages,
      },
      // @ts-expect-error
      context: {
        messages,
      },
    };
    return syntheticTransaction;
  }

  const transaction: IdxTransaction = await authClient.idx.proceed({
    ...idxOptions,
    otp,
  });
  return transaction;
};
