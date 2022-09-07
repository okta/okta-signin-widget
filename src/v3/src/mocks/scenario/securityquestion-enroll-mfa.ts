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

scenario('securityquestion-enroll-mfa', (rest) => ([
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

  // send email/pw, return authenticator list with security question enrollment choice
  rest.post('*/idp/idx/identify', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/identify/securityquestion-enroll-mfa.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),

  // send security question enroll, return security question enrollment view
  rest.post('*/idp/idx/credential/enroll', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/credential/enroll/securityquestion-enroll-mfa.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),

  // send security question data or return invalid answer for custom or predefined question when answer < 4 characters
  rest.post('*/idp/idx/challenge/answer', async (req, res, ctx) => {
    const request = req.body as Record<string, any>;
    const answer = request.credentials?.answer;
    if (answer?.length < 4) {
      return res(
        ctx.status(400),
        ctx.json((await import('../response/idp/idx/challenge/answer/enroll-security-question-with-character-limit-error.json')).default),
      );
    } else {
      return res(
        ctx.status(200),
        ctx.json((await import('../response/oauth2/default/v1/token/default.json')).default),
      );
    }
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
