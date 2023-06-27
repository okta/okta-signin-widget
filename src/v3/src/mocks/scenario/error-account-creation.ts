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

import { scenario } from '../registry';

scenario('error-account-creation', (rest) => ([
  // bootstrap
  rest.get('*/oauth2/default/.well-known/openid-configuration', async (req, res, ctx) => {
    const { default: body } = await import('../response/oauth2/default/well-known/openid-configuration/default.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  rest.post('*/oauth2/default/v1/interact', async (req, res, ctx) => {
    const { default: body } = await import('../response/oauth2/default/v1/interact/default.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  // show initial widget auth form
  rest.post('*/idp/idx/introspect', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/introspect/default.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  // cancels current flow
  rest.post('*/idp/idx/cancel', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/introspect/default.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  // initial clicking register button, return reg form
  rest.post('*/idp/idx/enroll', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/enroll/default.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  // error from idx for submitted registration form
  rest.post('*/idp/idx/enroll/new', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/enroll/new/error-account-creation.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),
]));
