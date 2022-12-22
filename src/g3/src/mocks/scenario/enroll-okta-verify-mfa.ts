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

scenario('enroll-okta-verify-mfa', (rest) => ([
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
    const { default: body } = await import('../response/idp/idx/credential/enroll/enroll-okta-verify-mfa.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  rest.post('*/idp/idx/credential/enroll', async (req, res, ctx) => {
    const request = req.body as Record<string, any>;
    const channel = request.authenticator?.channel;
    let response = null;
    if (!channel || channel === 'qrcode') {
      response = (await import('../response/idp/idx/credential/enroll/enroll-okta-verify-mfa.json')).default;
    } else if (channel === 'email') {
      response = (await import('../response/idp/idx/credential/enroll/enroll-ov-email-channel.json')).default;
    } else {
      response = (await import('../response/idp/idx/credential/enroll/enroll-ov-sms-channel.json')).default;
    }
    return res(
      ctx.status(200),
      ctx.json(response),
    );
  }),
  rest.post('*/idp/idx/challenge/send', async (req, res, ctx) => {
    const request = req.body as Record<string, any>;
    let response = null;
    if (request.email) {
      response = (await import('../response/idp/idx/challenge/send/enroll-ov-email-mfa.json')).default;
    } else {
      response = (await import('../response/idp/idx/challenge/send/enroll-ov-sms-mfa.json')).default;
    }
    return res(
      ctx.status(200),
      ctx.json(response),
    );
  }),
  // allowing poll to be called once before giving a successful response
  rest.post('*/idp/idx/challenge/poll', async (req, res, ctx) => {
    POLL_COUNTER += 1;
    let response = null;
    const ATTEMPTS_BEFORE_SUCCESS = 30 * 10000;
    if (POLL_COUNTER <= ATTEMPTS_BEFORE_SUCCESS) {
      response = (await import('../response/idp/idx/credential/enroll/enroll-okta-verify-mfa.json')).default;
    } else {
      response = (await import('../response/idp/idx/challenge/poll/enroll-ov-success.json')).default;
    }
    return res(
      ctx.status(200),
      ctx.json(response),
    );
  }),
]));
