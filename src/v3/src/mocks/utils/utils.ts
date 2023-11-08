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

import { IdxStatus, IdxTransaction } from '@okta/okta-auth-js';
import { IDX_STEP } from 'src/constants';
import { DataSchemaBag, FormBag, UISchemaLayoutType } from 'src/types';

export const getStubTransaction = (status: IdxStatus = IdxStatus.PENDING): IdxTransaction => ({
  status,
  proceed: jest.fn(),
  neededToProceed: [],
  rawIdxState: {
    version: '',
    stateHandle: '',
  },
  actions: {},
  context: {
    version: '',
    stateHandle: '',
    expiresAt: '',
    intent: '',
    currentAuthenticator: {
      type: '',
      value: {
        displayName: '',
        id: '',
        methods: [],
        key: '',
        type: '',
      },
    },
    authenticators: {
      type: '',
      value: [],
    },
    authenticatorEnrollments: {
      type: '',
      value: [],
    },
    enrollmentAuthenticator: {
      type: '',
      value: {
        displayName: '',
        id: '',
        methods: [],
        key: '',
        type: '',
      },
    },
    currentAuthenticatorEnrollment: {
      type: '',
      value: {
        displayName: '',
        id: '',
        methods: [],
        key: '',
        type: '',
      },
    },
    user: {
      type: '',
      value: {},
    },
    app: {
      type: '',
      value: {},
    },
  },
});

export const getStubTransactionWithNextStep = (stepName?: string): IdxTransaction => {
  const transaction = getStubTransaction();

  return { ...transaction, nextStep: { name: stepName ?? '' } };
};

export const getStubFormBag = (
  step?: string,
  orientation?: UISchemaLayoutType,
): FormBag => ({
  dataSchema: {
    submit: { step: step || IDX_STEP.CHALLENGE_AUTHENTICATOR },
    fieldsToTrim: [],
    fieldsToValidate: [],
    fieldsToExclude: () => ([]),
  } as DataSchemaBag,
  schema: {},
  uischema: {
    type: orientation || UISchemaLayoutType.VERTICAL,
    elements: [],
  },
  data: {},
});

export const getMockCreateCredentialsResponse = (): PublicKeyCredential => (
  {
    id: 'test',
    type: 'test',
    authenticatorAttachment: null,
    rawId: new ArrayBuffer(10),
    getClientExtensionResults: jest.fn(),
    response: {
      clientDataJSON: new ArrayBuffer(10),
      attestationObject: new ArrayBuffer(10),
    } as AuthenticatorAttestationResponse,
  } as PublicKeyCredential
);
