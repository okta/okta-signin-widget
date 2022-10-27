/*!
 * Copyright (c) 2021-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { ProceedOptions } from '@okta/okta-auth-js';

export async function emailVerifyCallback(settings) {
  const authClient = settings.getAuthClient();
  const idxOptions: ProceedOptions = {
    exchangeCodeForTokens: false, // we handle this in interactionCodeFlow.js
  };
  const meta = await authClient.idx.getSavedTransactionMeta(); // meta can load in another tab using state if it matches
  if (!meta || !meta.interactionHandle) {
    // Flow can not continue in this tab. Create a synthetic server response and use it to display a message to the user
    const messages = {
      type: 'array',
      value: [
        // terminal-return-otp-only-no-location.json
        {
          'message': 'Enter the OTP in your original browser or device.',
          'i18n': {
            'key': 'idx.enter.otp.in.original.tab'
          },
          'class': 'INFO'
        }
      ]
    };

    const resp = {
      neededToProceed: [],
      // OKTA-382410 so bad that has to leverage rawIdxState
      rawIdxState: {
        messages,
      },
      context: {
        messages,
      }
    };
    return resp;
  }
  
  // Proceed using the OTP code
  const otp = settings.get('otp');
  const idxResponse = await authClient.idx.proceed({
    ...idxOptions,
    otp
  });
  return idxResponse;
}
