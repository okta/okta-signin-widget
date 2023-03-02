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

const getRouteUrl = (url: string) => {
  const parts = url.split('/idp/idx/');
  return `*/idp/idx/${parts[1]}`;
};


/*
 * This mock scenario enables response <-> form 1:1 mapping
 * It is only designed to test/development functionalities within one specific form
 * Flow specific logic should be tested in E2E that target to a real OIE engine
 *
 * Mocked Endpoints:
 * 1) /oauth2 endpoints mock bootstrap requests
 * 2) /introspect endpoint mocks the response that renders the form
 * 3) all other mock endpoints mocks different actions in the form (poll, cancel, etc), all endpoints return the same response as the /introspect endpoint 
 */
scenario('development', (rest, response) => {
  const remediations = (response as any).remediation?.value;
  const currentAuthenticator = (response as any).currentAuthenticator?.value;
  const currentAuthenticatorEnrollment = (response as any).currentAuthenticatorEnrollment?.value;

  return [
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
    // mock /introspect response to render form
    rest.post('*/idp/idx/introspect', async (req, res, ctx) => {
      if (!response) {
        throw new Error('[MSW-Wrapper]: Set introspect response with "siw-mock-scenario" query param');
      }
  
      return res(
        ctx.status(200),
        ctx.json(response),
      );
    }),
    rest.post('*/idp/idx/cancel', async (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(response),
      );
    }),
    ...(remediations || []).map((remediation: any) => {
      const routeUrl = getRouteUrl(remediation.href);
      return rest.post(routeUrl, async (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json(response),
        );
      });
    }),
    ...Object.values(currentAuthenticator || currentAuthenticatorEnrollment || {})
      .filter((action: any) => action.href)
      .map((action: any) => {
        const routeUrl = getRouteUrl(action.href);
        return rest.post(routeUrl, async (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json(response),
          );
        });
    }),
  ];
});
