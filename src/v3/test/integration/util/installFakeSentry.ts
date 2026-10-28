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

type WindowWithSentry = typeof window & { Sentry?: unknown };

/**
 * Install a minimal v7 Sentry global, as published by the (prod or playground)
 * wrapper. The feedback UI only renders when this is present at widget mount.
 */
export const installFakeSentry = () => {
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

export const uninstallFakeSentry = () => {
  delete (window as WindowWithSentry).Sentry;
};
