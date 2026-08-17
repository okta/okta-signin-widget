/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
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

// N-of-M authenticator groups scenarios. Each scenario mirrors one of the five
// example wire responses in the SIW contract (idx-authenticator-groups-siw-contract):
//   * single required group, 1-of-3, nothing enrolled
//   * two required groups with an overlapping member (Okta Verify)
//   * optional-phase after satisfying a group
//   * single group with BY_DATE_TIME group grace period
//   * single group with BY_SKIP_COUNT group grace period
//
// Bootstrap requests (openid-configuration, /oauth2/default/v1/interact) reuse
// the default mock responses via the shared helpers.

const bootstrap = (rest: Parameters<Parameters<typeof scenario>[1]>[0]) => ([
  rest.get('*/oauth2/default/.well-known/openid-configuration', async (req, res, ctx) => {
    const { default: body } = await import('../response/oauth2/default/well-known/openid-configuration/default.json');
    return res(ctx.status(200), ctx.json(body));
  }),
  rest.post('*/oauth2/default/v1/interact', async (req, res, ctx) => {
    const { default: body } = await import('../response/oauth2/default/v1/interact/default.json');
    return res(ctx.status(200), ctx.json(body));
  }),
]);

scenario('select-authenticator-groups', (rest) => ([
  ...bootstrap(rest),
  rest.post('*/idp/idx/introspect', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/authenticator-enroll-select-authenticator-groups.json');
    return res(ctx.status(200), ctx.json(body));
  }),
]));

scenario('select-authenticator-groups-two', (rest) => ([
  ...bootstrap(rest),
  rest.post('*/idp/idx/introspect', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/authenticator-enroll-select-authenticator-groups-two.json');
    return res(ctx.status(200), ctx.json(body));
  }),
]));

scenario('select-authenticator-groups-optional-phase', (rest) => ([
  ...bootstrap(rest),
  rest.post('*/idp/idx/introspect', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/authenticator-enroll-select-authenticator-groups-optional-phase.json');
    return res(ctx.status(200), ctx.json(body));
  }),
]));

scenario('select-authenticator-groups-grace-period', (rest) => ([
  ...bootstrap(rest),
  rest.post('*/idp/idx/introspect', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/authenticator-enroll-select-authenticator-groups-grace-period.json');
    return res(ctx.status(200), ctx.json(body));
  }),
]));

scenario('select-authenticator-groups-grace-period-skip', (rest) => ([
  ...bootstrap(rest),
  rest.post('*/idp/idx/introspect', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/authenticator-enroll-select-authenticator-groups-grace-period-skip.json');
    return res(ctx.status(200), ctx.json(body));
  }),
]));

// Mixed page: standalone Password + arg-strong group (no grace period) in
// Required-now; standalone NFC (BY_SKIP_COUNT), standalone WebAuthn
// (BY_DATE_TIME), and arg-deadline group (BY_DATE_TIME) in Required-soon. This
// scenario is the only one that exercises the ungrouped-with-BY_DATE_TIME-GP
// path — the bucketing bug where a locale-formatted `gracePeriodExpiry` was
// mis-parsed as an ISO date.
scenario('select-authenticator-groups-mixed', (rest) => ([
  ...bootstrap(rest),
  rest.post('*/idp/idx/introspect', async (req, res, ctx) => {
    const { default: body } = await import('../response/idp/idx/authenticator-enroll-select-authenticator-groups-mixed.json');
    return res(ctx.status(200), ctx.json(body));
  }),
]));
