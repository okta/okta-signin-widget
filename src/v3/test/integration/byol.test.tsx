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
import { setup } from './util';

describe('byol', () => {
  describe('with unsupported language not loaded', () => {
    it('set with "language" option, is not loaded by default', async () => {
      const { container, findByText } = await setup({
        mockResponse,
        widgetOptions: { language: 'foo' },
      });
      await findByText(/Set up phone authentication/);
      expect(container).toMatchSnapshot();
    });

    it('should not load by default, even with assets.baseUrl set to a path containing the language assets with navigator.languages containing language', async () => {
      const navigatorLanguagesSpy = jest.spyOn(global, 'navigator', 'get');
      navigatorLanguagesSpy.mockReturnValue(
        { languages: ['foo'] } as unknown as Navigator,
      );
      const { container, findByText } = await setup({
        mockResponse,
        widgetOptions: { assets: { baseUrl: 'http://localhost:3000/mocks' } },
      });
      await findByText(/Set up phone authentication/);
      expect(container).toMatchSnapshot();
    });
  });

  describe('with unsupported language loaded', () => {
    it('set with "language" option, can be loaded when assets.baseUrl is set to a path containing the language assets', async () => {
      const { container, findByText } = await setup({
        mockResponse,
        widgetOptions: {
          language: 'foo',
          assets: { baseUrl: 'http://localhost:3000/mocks' },
        },
      });
      await findByText(/Set up foo authentication/);
      await findByText(/Foonited States/);
      expect(container).toMatchSnapshot();
    });

    it('should load with assets.baseUrl and assets.languages set and with navigator.languages containing language', async () => {
      const navigatorLanguagesSpy = jest.spyOn(global, 'navigator', 'get');
      navigatorLanguagesSpy.mockReturnValue(
        { languages: ['foo'] } as unknown as Navigator,
      );
      const { container, findByText } = await setup({
        mockResponse,
        widgetOptions: {
          assets: {
            baseUrl: 'http://localhost:3000/mocks',
            languages: ['foo'],
          },
        },
      });
      await findByText(/Set up foo authentication/);
      await findByText(/Foonited States/);
      expect(container).toMatchSnapshot();
    });
  });
});
