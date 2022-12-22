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

scenario('register-with-email-mfa', (rest) => ([
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
  rest.post('*/idp/idx/cancel', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/introspect/default.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  rest.post('*/idp/idx/identify/select', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/identify/select/default.json');
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
  // submit name/email
  rest.post('*/idp/idx/enroll/new', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/enroll/new/default.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  // pick email from email/password authenticator enrollment
  rest.post('*/idp/idx/credential/enroll', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/credential/enroll/request-email-mfa.json');
    return res.once(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  // picked email e.g., send code
  rest.post('*/idp/idx/challenge/answer', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/challenge/answer/enroll-password-remaining.json');
    return res.once(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  // pick password authenticator enrollment
  rest.post('*/idp/idx/credential/enroll', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/credential/enroll/request-password.json');
    return res.once(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  // picked password e.g., send new password
  rest.post('*/idp/idx/challenge/answer', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/challenge/answer/enroll-sms-remaining.json');
    return res.once(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  // choose 'phone_number' for enrollment (only choice)
  rest.post('*/idp/idx/credential/enroll', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/credential/enroll/request-phone.json');
    return res.once(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  // send 'sms' and phone number for phone mfa enrollment
  rest.post('*/idp/idx/credential/enroll', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/credential/enroll/request-sms-mfa.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),
  // send sms verification code
  rest.post('*/idp/idx/challenge/answer', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/challenge/answer/default.json');
    return res.once(
      ctx.status(200),
      ctx.json(body),
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
