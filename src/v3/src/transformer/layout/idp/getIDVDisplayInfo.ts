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

import { IdxTransaction } from '@okta/okta-auth-js';

export type IdvDisplayInfo = {
  idpName?: string;
  termsOfUse?: string;
  privacyPolicy?: string;
};

export const getIDVDisplayInfo = (
  transaction: IdxTransaction,
): IdvDisplayInfo => {
  const idpName = transaction.nextStep?.idp?.name;
  let termsOfUse;
  let privacyPolicy;
  switch (idpName?.toUpperCase()) {
    case 'PERSONA':
      termsOfUse = 'https://withpersona.com/legal/terms-of-use';
      privacyPolicy = 'https://withpersona.com/legal/privacy-policy';
      break;
    case 'CLEAR':
      termsOfUse = 'https://www.clearme.com/member-terms';
      privacyPolicy = 'https://www.clearme.com/privacy-policy';
      break;
    case 'INCODE':
      termsOfUse = 'https://incode.id/terms';
      privacyPolicy = 'https://incode.id/privacy';
      break;
    default:
      termsOfUse = undefined;
      privacyPolicy = undefined;
      break;
  }
  return {
    idpName,
    privacyPolicy,
    termsOfUse,
  };
};
