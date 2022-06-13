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

scenario('unlock-account-email-securityquestion', (rest) => ([
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
    const { default: body } = await import('../response/idp/idx/introspect/all-enabled-features.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),

  // cancel (to be safe we call cancel before embarking on a different flow)
  rest.post('*/idp/idx/cancel', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/introspect/default.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),

  // recover (entering recover flow)
  rest.post('*/idp/idx/unlock-account', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/unlock-account/default.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),

  // identify (sent the username/email)
  rest.post('*/idp/idx/identify', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/identify/password-reset.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),

  // challenge (sent the email verification type)
  rest.post('*/idp/idx/challenge', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/challenge/unlock-account-email.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),

  // polling request
  rest.post('*/idp/idx/challenge/poll', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/challenge/unlock-account-email.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),

  // resend - same response as challenge
  rest.post('*/idp/idx/challenge/resend', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/challenge/unlock-account-email.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),

  // answer (sent the code) - encounter custom security question
  rest.post('*/idp/idx/challenge/answer', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/identify/securityquestion-custom-verify.json');
    return res.once(
      ctx.status(200),
      ctx.json(body),
    );
  }),

  // answer (sent the code)
  rest.post('*/idp/idx/challenge/answer', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/challenge/answer/unlock-account-success.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),
]));
