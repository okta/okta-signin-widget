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

import mockResponse from '@okta/mocks/data/idp/idx/authenticator-enroll-data-phone.json';
import loginFooBundle from '@okta/mocks/labels/json/login_foo.json';
import countryFooBundle from '@okta/mocks/labels/json/country_foo.json';
import { waitFor, cleanup } from '@testing-library/preact';
import { rest } from 'msw';
import { SetupServer, setupServer } from 'msw/node';
import { setup } from './util';

describe('byol', () => {
  beforeEach(() => {
    // language is cached after first test so disabling caching for this test
    jest.spyOn(global, 'localStorage', 'get').mockReturnValue({
      length: 0,
      clear: () => jest.fn(),
      getItem: () => null,
      setItem: () => jest.fn(),
      key: () => null,
      removeItem: () => jest.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('loading custom language', () => {
    const server: SetupServer = setupServer();
    beforeAll(() => {
      server.listen();
    });

    beforeEach(() => {
      server.use(
        rest.get('http://localhost:1234/mocks/labels/json/login_foo.json', async (_, res, ctx) => res(
          ctx.status(200),
          ctx.json(loginFooBundle),
        )),
        rest.get('http://localhost:1234/mocks/labels/json/country_foo.json', async (_, res, ctx) => res(
          ctx.status(200),
          ctx.json(countryFooBundle),
        )),
      );
    });

    afterEach(() => {
      server.resetHandlers();
    });

    afterAll(() => {
      server.close();
    });

    it('should load custom language with assets.baseUrl and assets.languages set and with navigator.languages containing language', async () => {
      const navigatorLanguagesSpy = jest.spyOn(global, 'navigator', 'get');
      navigatorLanguagesSpy.mockReturnValue(
        { languages: ['foo'] } as unknown as Navigator,
      );
      const { container, findByText } = await setup({
        mockResponse,
        widgetOptions: {
          assets: {
            baseUrl: 'http://localhost:1234/mocks',
            languages: ['foo'],
          },
        },
      });
      await waitFor(async () => {
        await findByText(/Set up foo authentication/);
        await findByText(/Foonited States/);
      });
      expect(container).toMatchSnapshot();
    });

    it('should load custom language with "language" option defined, and assets.baseUrl is set to a path containing the language assets', async () => {
      const { container, findByText } = await setup({
        mockResponse,
        widgetOptions: {
          language: 'foo',
          assets: { baseUrl: 'http://localhost:1234/mocks' },
        },
      });
      await waitFor(async () => {
        await findByText(/Set up foo authentication/);
        await findByText(/Foonited States/);
      });
      expect(container).toMatchSnapshot();
    });
  });

  describe('loading default language', () => {
    it('should not load custom language with "language" option set when assets.baseUrl value is missing', async () => {
      const { container, findByText } = await setup({
        mockResponse,
        widgetOptions: { language: 'foo' },
      });
      await waitFor(async () => { await findByText(/Set up phone authentication/); });
      expect(container).toMatchSnapshot();
    });

    it('should not load custom language when the language/assets.languages value is not provided '
      + 'while assets.baseUrl is set to a path containing the language assets and navigator.languages containing language', async () => {
      const navigatorLanguagesSpy = jest.spyOn(global, 'navigator', 'get');
      navigatorLanguagesSpy.mockReturnValue(
        { languages: ['foo'] } as unknown as Navigator,
      );
      const { container, findByText } = await setup({
        mockResponse,
        widgetOptions: { assets: { baseUrl: 'http://localhost:1234/mocks' } },
      });
      await findByText(/Set up phone authentication/);
      expect(container).toMatchSnapshot();
    });
  });
});
