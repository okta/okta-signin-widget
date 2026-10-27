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

import { setup } from './util';

// Own file: a fatal bootstrap error must be the first render in the module, or
// state cached by earlier renders (see feedback.test.tsx) masks the failure.
describe('feedback-bootstrap-error', () => {
  it('replaces the view with the "Report issue" form when bootstrap fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockRequestClient = jest.fn().mockRejectedValue({
      responseText: JSON.stringify({ errorSummary: 'Internal Server Error' }),
      status: 500,
      headers: {},
    });
    const { findByTestId, queryByTestId, findByText } = await setup({
      mockRequestClient,
      widgetOptions: { feedback: { enabled: true } },
    });

    expect(await findByTestId('feedback-report-error')).toBeInTheDocument();
    expect(await findByText('Report issue to Okta')).toBeInTheDocument();
    expect(queryByTestId('send-feedback-link')).not.toBeInTheDocument();
    expect(queryByTestId('feedback-terminal')).not.toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });
});
