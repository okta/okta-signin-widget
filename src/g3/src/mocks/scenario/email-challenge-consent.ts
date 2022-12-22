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

scenario('email-challenge-consent', (rest) => ([
  // bootstrap
  rest.get('*/oauth2/default/.well-known/openid-configuration', async (req, res, ctx) => {
    const { default: body } = await import('../response/oauth2/default/well-known/openid-configuration/default.json');
    return res(
      ctx.status(200),
      ctx.json(body),
    );
  }),

  rest.post('*/idp/idx/introspect', async (req, res, ctx) => {
    // ensure Record type
    if (req.body !== null && typeof req.body === 'object' && !Array.isArray(req.body)) {
      const { stateToken } = req.body;
      // only respond if the widget was bootstrapped with a state token
      if (typeof stateToken === 'string' && stateToken !== '') {
        const { default: body } = await import('../response/idp/idx/introspect/email-challenge-consent.json');
        return res(
          ctx.status(200),
          ctx.json(body),
        );
      }
    }
    throw new Error('Expected a stateToken in the introspect payload!');
  }),
  rest.post('*/idp/idx/consent', async (req, res, ctx) => {
    const request = req.body as Record<string, any>;
    const consent = request.consent;
    let response = null;
    if (consent) {
      response = (await import('../response/idp/idx/introspect/terminal-return-email.json')).default;
    } else {
      response = (await import('../response/idp/idx/introspect/terminal-return-email-consent-denied.json')).default;
    }
    return res(
      ctx.status(200),
      ctx.json(response),
    );
  }),
]));
