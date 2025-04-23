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
import { TinyEmitter as EventEmitter } from 'tiny-emitter';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { OktaAuth } from '@okta/okta-auth-js';
import { WidgetOptions } from 'src/types';
import { createAuthClient, CreateAuthClientOptions } from './createAuthClient';

import { Widget } from '../../../src/components/Widget';
import { WidgetHooks } from '../../../src/util/widgetHooks';

type Options = CreateAuthClientOptions & {
  widgetOptions?: Partial<WidgetOptions>;
};

/*
 * See manual mock for loc util in src/v3/jest.setup.js
 * This globally overwrites loc function
 * For integration tests we want the translated string to render
 * According to jest documentation, must use the unmock function below
 * https://jestjs.io/docs/manual-mocks#examples
*/
jest.unmock('util/loc');

export async function setup(options: Options): Promise<RenderResult & {
  authClient: OktaAuth;
  user: UserEvent;
  pauseMocks: () => void;
  resumeMocks: () => void;
}> {
  const { widgetOptions = {}, ...rest } = options;
  const { authClient, pauseMocks, resumeMocks } = createAuthClient(rest);
  const eventEmitter = new EventEmitter();
  const widgetHooks = new WidgetHooks(widgetOptions.hooks);
  const renderResult = await render(
    <Widget
      authScheme="Oauth2"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...widgetOptions}
      authClient={authClient}
      eventEmitter={eventEmitter}
      widgetHooks={widgetHooks}
    />,
  );

  return {
    authClient,
    pauseMocks,
    resumeMocks,
    // https://github.com/testing-library/user-event/issues/833#issuecomment-1013632841
    user: userEvent.setup({ delay: null }),
    ...renderResult,
  };
}
