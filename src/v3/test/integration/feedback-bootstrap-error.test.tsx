/*
 * Copyright (c) 2025-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { installFakeSentry, setup, uninstallFakeSentry } from './util';

// Own file: a fatal bootstrap error must be the first render in the module, or
// state cached by earlier renders (see feedback.test.tsx) masks the failure.
describe('feedback-bootstrap-error', () => {
  beforeEach(() => {
    installFakeSentry();
  });

  afterEach(() => {
    uninstallFakeSentry();
  });

  it('keeps the specific error message and shows the "Send feedback" link', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockRequestClient = jest.fn().mockRejectedValue({
      responseText: JSON.stringify({ errorSummary: 'Internal Server Error' }),
      status: 500,
      headers: {},
    });
    const { findByTestId, queryByTestId } = await setup({
      mockRequestClient,
      widgetOptions: { feedback: { enabled: true } },
    });

    // transformUnhandledErrors' own message for this error, not a generic
    // "Unable to load page" (expected user errors must keep their message)
    const callout = await findByTestId('callout');
    expect(callout).toHaveTextContent('The server encountered an error. Please refresh the page and try again.');
    // Unhandled errors get the link + dialog; only error terminals get the inline form.
    expect(await findByTestId('send-feedback-link')).toBeInTheDocument();
    expect(queryByTestId('feedback-terminal')).not.toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });
});
