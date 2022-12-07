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

import identify from '@okta/mocks/data/idp/idx/identify.json';
import withCredentialMock from '@okta/mocks/data/idp/idx/identify-with-apple-credential-sso-extension.json';
import noCredentialMock from '@okta/mocks/data/idp/idx/identify-with-no-sso-extension.json'
import stepUpError from '@okta/mocks/data/idp/idx/error-401-okta-verify-apple-sso-step-up.json';
import { setup } from './util';

    const verifyUrl = 'http://localhost:3000/idp/idx/authenticators/sso_extension/transactions/123/verify?\
challengeRequest=eyJraWQiOiJCa2Y3LTVqa2d6eE1NYjBtS0pEX3hpaUxzZFNmLXZ6cks0MmFkcmcyWXEwIiwiYWxnIjoiUlMy\
NTYifQ.eyJpc3MiOiJodHRwczovL2R0ZGVtby53aWRlcm9jay5jb20iLCJhdWQiOiJva3RhLjYzYzA4MWRiLTFmMTMtNTA4NC04OD\
JmLWU3OWUxZTVlMmRhNyIsImV4cCI6MTU3ODYxODEzMiwiaWF0IjoxNTc4NjE3ODMyLCJqdGkiOiJ0cmFuc2FjdGlvbklkIiwibm9\
uY2UiOiJzYW1wbGVOb25jZSIsInNpZ25hbHMiOlsic2NyZWVuTG9jayIsInJvb3RQcml2aWxlZ2VzIiwiZnVsbERpc2tFbmNyeXB0\
aW9uIiwiaWQiLCJwbGF0Zm9ybSIsIm9zVmVyc2lvbiIsIm1hbnVmYWN0dXJlciIsIm1vZGVsIiwiZGV2aWNlQXR0ZXN0YXRpb24iX\
SwidXNlclZlcmlmaWNhdGlvblJlcXVpcmVtZW50IjpmYWxzZSwidmVyaWZpY2F0aW9uVXJpIjoiaHR0cHM6Ly9kdGRlbW8ud2lkZX\
JvY2suY29tL2F1dGhlbnRpY2F0b3JzL3Nzb19leHRlbnNpb24vdHJhbnNhY3Rpb25zL3t0cmFuc2FjdGlvbklkfS92ZXJpZnkiLCJ\
jYVN1YmplY3ROYW1lcyI6W10sImtleVR5cGUiOiJwcm9vZk9mUG9zc2Vzc2lvbiIsImZhY3RvclR5cGUiOiJjcnlwdG8iLCJ2ZXIi\
OjB9.aCsWAQHdU3MG6w7ZQl1csuw2UFb1yvH3es97McC6lFswAphkz6bIHNcagob2dhTwWMJ7_RbpZHqXcaZJ7skKZxYHEfdC9Uwr\
RzdHpy_4Oeq477n4NGsJLvJNKDi_FOEulqAtCMnjh20vEJI6e4uNIxoSSCfxRCzp-0tdRIJ_7dGM-IsyFjefcnbDyFZT7s4l1tbeO\
7KYXmWXzP00bA8jmcGLb7i9bFwhjw9OBCgdNcqxKXMLmWQA0JZritRDR6u0ZcEjykca-eUCJtG5ISQOONs_lUBGL3Ezz6QsfWtW16\
E9QJAVEwf06gULnbw5n6wpiAiDqa4HlkKP6K5-v1Y0XQ';
const cancelUrl = 'http://localhost:3000/idp/idx/authenticators/sso_extension/transactions/456/verify/cancel';

describe('authenticator-apple-sso-extension', () => {
  it('opens the verify url with credential SSO Extension approach', async () => {

    const {
      container,
      findByLabelText,
    } = await setup({
      mockResponses: {
        '/introspect': {
          data: withCredentialMock,
          status: 200,
        },
        [verifyUrl]: {
          data: identify,
          status: 200,
        },
      },
    });

    await findByLabelText(/Username/);
    expect(container).toMatchSnapshot();
  });

  it('cancels the transaction when sso extension authenticator does not exist', async () => {

    const {
      container,
      findByLabelText,
    } = await setup({
      mockResponses: {
        '/introspect': {
          data: noCredentialMock,
          status: 200,
        },
        [cancelUrl]: {
          data: identify,
          status: 200,
        },
      },
    });

    await findByLabelText(/Username/);
    expect(container).toMatchSnapshot();
  });

  it('calls verify then cancels the transaction when step up error is encountered', async () => {

    const {
      container,
      findByLabelText,
    } = await setup({
      mockResponses: {
        '/introspect': {
          data: withCredentialMock,
          status: 200,
        },
        [verifyUrl]: {
          data: stepUpError,
          status: 200,
        },
        [cancelUrl]: {
          data: identify,
          status: 200,
        },
      },
    });

    await findByLabelText(/Username/);
    expect(container).toMatchSnapshot();
  });
});
