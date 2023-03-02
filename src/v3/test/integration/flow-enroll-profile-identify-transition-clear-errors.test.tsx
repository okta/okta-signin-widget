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

import enrollProfile from '@okta/mocks/data/idp/idx/enroll-profile-new.json';
import identifyWithPassword from '../../src/mocks/response/idp/idx/identify/select/default.json';
import { setup } from './util';

describe('flow-enroll-profile-transition-clear-errors', () => {
  it('should clear global errors when transitioning between pages', async () => {
    const {
      user,
      queryByText,
      findByText,
      authClient,
    } = await setup({
      mockResponses: {
        '/introspect': {
          data: enrollProfile,
          status: 200,
        },
        '/idx/identify/select': {
          data: identifyWithPassword,
          status: 200,
        },
      },
    });

    const submitButton = await findByText('Sign Up', { selector: 'button' });

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).not.toHaveBeenCalledWith(
      'POST',
      'http://localhost:3000/idp/idx/enroll/new',
      expect.anything(),
    );
    await findByText(/We found some errors./);
    const signinLink = await findByText('Sign In', { selector: 'a' });
    await user.click(signinLink);
    await findByText(/Sign In/);
    expect(queryByText(/We found some errors./)).toBeNull();
  });
});
