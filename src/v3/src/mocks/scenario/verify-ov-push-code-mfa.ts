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

let POLL_COUNTER = 0;

scenario('verify-ov-push-code-mfa', (rest) => ([
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
  rest.post('*/idp/idx/introspect', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/introspect/default.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  rest.post('*/idp/idx/identify', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/identify/verify-ov-mfa.json');
    return res.once(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  // autoChallenge = false
  rest.post('*/idp/idx/challenge', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/challenge/verify-ov-push-method.json');
    return res.once(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  // autoChallenge = false & send push manually
  rest.post('*/idp/idx/challenge', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/challenge/verify-ov-push-manual.json');
    return res.once(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  // Poll response
  rest.post('*/idp/idx/authenticators/poll', async (req, res, ctx) => {
    POLL_COUNTER += 1;
    let response = null;
    const ATTEMPTS_BEFORE_SUCCESS = 4;
    if (POLL_COUNTER <= ATTEMPTS_BEFORE_SUCCESS) {
      response = (await import('../response/idp/idx/challenge/verify-ov-push-manual.json')).default;
    } else {
      response = (await import('../response/idp/idx/authenticators/poll/verify-ov-push-manual-success.json')).default;
    }
    return res(
      ctx.status(200),
      ctx.json(response),
    );
  }),
  // get oauth2 token
  rest.post('*/oauth2/default/v1/token', async (req, res, ctx) => {
    const { default: body } = await import('../response/oauth2/default/v1/token/default.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  // get oauth2 keys
  rest.get('*/oauth2/default/v1/keys', async (req, res, ctx) => {
    const { default: body } = await import('../response/oauth2/default/v1/keys/default.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),
]));
