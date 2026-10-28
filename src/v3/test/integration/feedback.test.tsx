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

import identify from '../../src/mocks/response/idp/idx/introspect/identify-with-username.json';
import errorTerminal from '../../src/mocks/response/idp/idx/introspect/terminal-return-email-error.json';
import infoTerminal from '../../src/mocks/response/idp/idx/introspect/terminal-reset-password-success.json';

type WindowWithSentry = typeof window & { Sentry?: unknown };

// Minimal v7 Sentry global, as published by the (prod or playground) wrapper.
const installFakeSentry = () => {
  const replay = {
    flush: jest.fn().mockResolvedValue(undefined),
    getReplayId: jest.fn().mockReturnValue('replay-123'),
  };
  const Replay = function Replay() {};
  const Sentry = {
    Replay,
    getCurrentHub: () => ({
      getClient: () => ({}),
      getIntegration: (klass: unknown) => (klass === Replay ? replay : undefined),
    }),
    withScope: (cb: (scope: unknown) => void) => cb({ setTags: jest.fn() }),
    captureMessage: jest.fn().mockReturnValue('event-abc'),
    captureUserFeedback: jest.fn(),
    flush: jest.fn().mockResolvedValue(true),
  };
  (window as WindowWithSentry).Sentry = Sentry;
  return Sentry;
};

const widgetOptions = { feedback: { enabled: true } };
const errorMessage = /Could not process this email link/;

const isBefore = (a: Node, b: Node) => Boolean(
  // eslint-disable-next-line no-bitwise
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING,
);

describe('feedback', () => {
  let Sentry: ReturnType<typeof installFakeSentry>;

  beforeEach(() => {
    // Earlier renders persist a stateHandle; clear it so each test bootstraps fresh.
    window.sessionStorage.clear();
    Sentry = installFakeSentry();
  });

  afterEach(() => {
    delete (window as WindowWithSentry).Sentry;
  });

  describe.each([
    ['error', errorTerminal, errorMessage],
    ['info', infoTerminal, /You can now sign in with your existing username and new password/],
  ])('%s terminal view', (_, mockResponse, message) => {
    it('renders the inline form between the message and the back link', async () => {
      const {
        findByText, getByTestId, getByText, queryByTestId,
      } = await setup({ mockResponse, widgetOptions });

      const messageEl = await findByText(message);
      const form = getByTestId('feedback-terminal');
      const backLink = getByText(/Back to sign in/);

      expect(isBefore(messageEl, form)).toBe(true);
      expect(isBefore(form, backLink)).toBe(true);
      expect(getByText('Send feedback to Okta')).toBeInTheDocument();
      // Terminal views get the inline form, not the bottom-of-view link.
      expect(queryByTestId('send-feedback-link')).not.toBeInTheDocument();
    });
  });

  // One full-widget send flow is enough (the collapse itself is unit-tested in
  // transformTerminalTransaction for any terminal); a second copy made this file
  // the slowest on CI and pushed it past the 10s jest timeout.
  it('collapses a terminal view to the success message + back link after sending', async () => {
    const {
      user, findByText, findByTestId, getByTestId, queryByText, queryByTestId,
    } = await setup({ mockResponse: errorTerminal, widgetOptions });

    expect(await findByText(errorMessage)).toBeInTheDocument();
    // Keep the typed text short: each keystroke re-renders the whole widget,
    // and long strings blow past the 10s jest timeout on CI.
    await user.type(getByTestId('feedback-terminal-comment'), 'stuck');
    await user.click(getByTestId('feedback-terminal-consent'));
    await user.click(getByTestId('feedback-terminal-submit'));

    expect(await findByTestId('feedback-terminal-success')).toBeInTheDocument();
    expect(queryByText(errorMessage)).not.toBeInTheDocument();
    expect(queryByTestId('feedback-terminal')).not.toBeInTheDocument();
    expect(await findByText(/Back to sign in/)).toBeInTheDocument();
    expect(Sentry.captureUserFeedback).toHaveBeenCalledWith(expect.objectContaining({
      comments: 'stuck',
    }));
  });

  it('does not render any feedback surface when feedback is not enabled', async () => {
    const { findByText, queryByTestId } = await setup({ mockResponse: errorTerminal });

    expect(await findByText(errorMessage)).toBeInTheDocument();
    expect(queryByTestId('feedback-terminal')).not.toBeInTheDocument();
    expect(queryByTestId('send-feedback-link')).not.toBeInTheDocument();
  });

  it('shows the "Send feedback" link on an actionable step', async () => {
    const { findByTestId, queryByTestId } = await setup({ mockResponse: identify, widgetOptions });

    expect(await findByTestId('send-feedback-link')).toBeInTheDocument();
    expect(queryByTestId('feedback-terminal')).not.toBeInTheDocument();
  });
});
