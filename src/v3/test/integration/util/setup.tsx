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

import userEvent from '@testing-library/user-event';
import { render, RenderResult } from '@testing-library/preact';
import { h } from 'preact';
import { UserEvent } from '@testing-library/user-event/dist/types/setup';
import { OktaAuth } from '@okta/okta-auth-js';
import { WidgetOptions } from 'src/types';
import { createAuthClient, CreateAuthClientOptions } from './createAuthClient';

import { Widget } from '../../../src/components/Widget';

type Options = CreateAuthClientOptions & {
  widgetOptions?: Partial<WidgetOptions>;
};

/*
 * See manual mock for okta package in src/v3/__mocks__/okta.js
 * This globally overwrites the okta package's loc function
 * For integration tests we want the translated string to render
 * According to jest documentation, must use the unmock function below
 * https://jestjs.io/docs/manual-mocks#examples
*/
jest.unmock('okta');

export async function setup(options: Options): Promise<RenderResult & {
  authClient: OktaAuth;
  user: UserEvent;
}> {
  const { widgetOptions = {}, ...rest } = options;
  const authClient = createAuthClient(rest);
  const renderResult = await render(
    <Widget
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...widgetOptions}
      useInteractionCodeFlow
      authClient={authClient}
    />,
  );

  return {
    authClient,
    // https://github.com/testing-library/user-event/issues/833#issuecomment-1013632841
    user: userEvent.setup({ delay: null }),
    ...renderResult,
  };
}
