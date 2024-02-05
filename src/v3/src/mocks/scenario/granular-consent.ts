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

scenario('granular-consent', (rest) => ([
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
  rest.post('*/idp/idx/introspect', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/introspect/consent-granular.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  rest.post('*/idp/idx/consent', async (req, res, ctx) => {
    const { consent } = await req.json();
    if (consent) {
    const { default: body } = await import('../response/idp/idx/consent/success.json');
      return res(
        ctx.status(200),
        ctx.json(body),
      );
    } else {
      const { default: body } = await import('../response/idp/idx/consent/denied.json');
      return res(
        ctx.status(403),
        ctx.json(body),
      );
    }
  }),
  rest.post('*/oauth2/default/v1/token', async (req, res, ctx) => {
    const { default: body } = await import('../response/oauth2/default/v1/token/default.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),
]));
