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

import { waitFor } from '@testing-library/preact';

import mockResponse from '../../../../playground/mocks/data/idp/idx/device-code-activate.json';
import { createAuthJsPayloadArgs, setup } from './util';

describe('device-code-activate', () => {
  it('should render form', async () => {
    const { container, findByRole } = await setup({ mockResponse });
    const heading = await findByRole('heading', { level: 1 });

    expect(heading.textContent).toBe('Activate your device');
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload', async () => {
    const {
      authClient, user, findByLabelText, findByRole, findByText,
    } = await setup({ mockResponse, widgetOptions: { features: { autoFocus: true } } });

    const heading = await findByRole('heading', { level: 1 });

    expect(heading.textContent).toBe('Activate your device');

    const submitButton = await findByText('Next', { selector: 'button' });
    const userCodeEle = await findByLabelText(/^Activation Code/) as HTMLInputElement;
    await waitFor(() => expect(userCodeEle).toHaveFocus());

    const code = '12345678';
    const hyphenatedCode = '1234-5678';
    await user.type(userCodeEle, code);

    // Expect that the user code input properly hyphenates after the 4th character
    expect(userCodeEle.value).toEqual(hyphenatedCode);

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/device/activate', {
        userCode: hyphenatedCode,
      }, 'application/vnd.okta.v1+json'),
    );
  });
});
