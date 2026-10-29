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

import BrowserFeatures from '../../../util/BrowserFeatures';
import { isFeedbackAvailable, resolveSentry, sendFeedbackToSentry } from './sentryFeedback';

type AnyWindow = typeof window & { Sentry?: unknown };

// A minimal v7 Sentry stand-in: records the calls the sender makes so we can
// assert the tag set, the replay flush/link, and the user-feedback payload.
const makeFakeSentry = (opts?: {
  withClient?: boolean;
  withReplay?: boolean;
  replayId?: string;
}) => {
  const {
    withClient = true, withReplay = true, replayId = 'replay-123',
  } = opts ?? {};
  const replay = {
    flush: jest.fn().mockResolvedValue(undefined),
    getReplayId: jest.fn().mockReturnValue(replayId),
  };
  let capturedScope: {
    setTags: jest.Mock; setContext: jest.Mock; clearBreadcrumbs: jest.Mock;
  } | undefined;
  const Replay = function Replay() {}; // integration class token
  const Sentry = {
    Replay,
    getCurrentHub: jest.fn(() => ({
      getClient: jest.fn(() => (withClient ? {} : undefined)),
      getIntegration: jest.fn((klass: unknown) => (
        withReplay && klass === Replay ? replay : undefined
      )),
    })),
    withScope: jest.fn((cb: (scope: unknown) => void) => {
      capturedScope = { setTags: jest.fn(), setContext: jest.fn(), clearBreadcrumbs: jest.fn() };
      cb(capturedScope);
    }),
    captureMessage: jest.fn().mockReturnValue('event-abc'),
    captureUserFeedback: jest.fn(),
    flush: jest.fn().mockResolvedValue(true),
  };
  return {
    Sentry, replay, getScope: () => capturedScope,
  };
};

describe('sentryFeedback', () => {
  const w = window as AnyWindow;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    delete w.Sentry;
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete w.Sentry;
  });

  describe('resolveSentry', () => {
    it('returns undefined when no global Sentry is present', () => {
      expect(resolveSentry()).toBeUndefined();
    });

    it('returns undefined when Sentry present but not initialized (no client)', () => {
      const { Sentry } = makeFakeSentry({ withClient: false });
      w.Sentry = Sentry;
      expect(resolveSentry()).toBeUndefined();
    });

    it('returns the global when initialized', () => {
      const { Sentry } = makeFakeSentry();
      w.Sentry = Sentry;
      expect(resolveSentry()).toBe(Sentry);
    });
  });

  describe('isFeedbackAvailable', () => {
    it('is false when feedback is not enabled, even with the wrapper present', () => {
      w.Sentry = makeFakeSentry().Sentry;
      expect(isFeedbackAvailable(false)).toBe(false);
      expect(isFeedbackAvailable(undefined)).toBe(false);
    });

    it('is false and warns when enabled but window.Sentry is missing', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(isFeedbackAvailable(true)).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('window.Sentry is not initialized'));
    });

    it('is false when the global exists but has no initialized client', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      w.Sentry = makeFakeSentry({ withClient: false }).Sentry;
      expect(isFeedbackAvailable(true)).toBe(false);
    });

    it('is true when enabled and the wrapper has initialized window.Sentry', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      w.Sentry = makeFakeSentry().Sentry;
      expect(isFeedbackAvailable(true)).toBe(true);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('is false in IE11, even when enabled and the wrapper is initialized', () => {
      jest.spyOn(BrowserFeatures, 'isIE').mockReturnValue(true);
      w.Sentry = makeFakeSentry().Sentry;
      expect(isFeedbackAvailable(true)).toBe(false);
    });
  });

  describe('sendFeedbackToSentry', () => {
    it('no-ops loudly when window.Sentry is absent', async () => {
      const result = await sendFeedbackToSentry({ comment: 'hi' });
      expect(result).toEqual({ ok: false });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('window.Sentry not found'),
      );
    });

    it('flushes the replay and links its id to the captured event', async () => {
      const { Sentry, replay } = makeFakeSentry({ replayId: 'rep-9' });
      w.Sentry = Sentry;

      const result = await sendFeedbackToSentry({
        comment: 'broken',
        context: { flow: 'authenticate', formName: 'challenge-authenticator', factor: 'okta_verify' },
      });

      expect(replay.flush).toHaveBeenCalledTimes(1);
      // Stop recording after the upload: only the pre-send buffer is consented to.
      expect(replay.flush).toHaveBeenCalledWith({ continueRecording: false });
      expect(Sentry.captureMessage).toHaveBeenCalledWith('SIW user feedback', 'info');
      expect(Sentry.captureUserFeedback).toHaveBeenCalledWith(expect.objectContaining({
        event_id: 'event-abc',
        comments: 'broken',
      }));
      expect(result).toEqual({ ok: true, eventId: 'event-abc', replayId: 'rep-9' });
    });

    it('sets the fixed low-cardinality tag set, using `factor` (not authenticatorKey)', async () => {
      const { Sentry, getScope } = makeFakeSentry();
      w.Sentry = Sentry;

      await sendFeedbackToSentry({
        context: { flow: 'authenticate', formName: 'challenge-authenticator', factor: 'okta_verify' },
      });

      const scope = getScope();
      const tags = scope?.setTags.mock.calls[0][0];
      expect(tags).toMatchObject({
        engine: 'gen3',
        flow: 'authenticate',
        formName: 'challenge-authenticator',
        factor: 'okta_verify',
        hasReplay: true,
      });
      // Linked via the `replay` context, never a `replayId` tag (which would make
      // the buffer-mode SDK restart full session recording).
      expect(Object.keys(tags)).not.toContain('replayId');
      expect(scope?.setContext).toHaveBeenCalledWith('replay', { replay_id: 'replay-123' });
      // page breadcrumbs (console, fetch/XHR URLs, clicks) never ride on the carrier event
      expect(scope?.clearBreadcrumbs).toHaveBeenCalledBefore(Sentry.captureMessage);
      // never leak an authenticator* key (org scrubber strips auth* fields)
      expect(Object.keys(tags)).not.toContain('authenticatorKey');
    });

    it('still sends (hasReplay:false) when no Replay integration is registered', async () => {
      const { Sentry, getScope } = makeFakeSentry({ withReplay: false });
      w.Sentry = Sentry;

      const result = await sendFeedbackToSentry({ comment: 'x' });

      expect(result).toEqual({ ok: true, eventId: 'event-abc', replayId: undefined });
      expect(getScope()?.setTags.mock.calls[0][0]).toMatchObject({ hasReplay: false });
    });

    it('substitutes a placeholder comment when none is provided', async () => {
      const { Sentry } = makeFakeSentry();
      w.Sentry = Sentry;

      await sendFeedbackToSentry();

      expect(Sentry.captureUserFeedback).toHaveBeenCalledWith(expect.objectContaining({
        comments: 'SIW user feedback (no comment)',
      }));
    });

    it('is best-effort: a replay flush failure does not block the send', async () => {
      const { Sentry, replay } = makeFakeSentry();
      replay.flush.mockRejectedValueOnce(new Error('flush boom'));
      w.Sentry = Sentry;

      const result = await sendFeedbackToSentry({ comment: 'x' });

      expect(result.ok).toBe(true);
      expect(Sentry.captureUserFeedback).toHaveBeenCalled();
    });

    it('passes the trimmed email through to the user feedback entry', async () => {
      const { Sentry } = makeFakeSentry();
      w.Sentry = Sentry;

      await sendFeedbackToSentry({ comment: 'hi', email: '  john.smith@email.com  ' });

      expect(Sentry.captureUserFeedback).toHaveBeenCalledWith(expect.objectContaining({
        email: 'john.smith@email.com',
      }));
    });

    it('does NOT flush/link the replay when attachLogs is false (consent withheld)', async () => {
      const { Sentry, replay, getScope } = makeFakeSentry({ replayId: 'rep-7' });
      w.Sentry = Sentry;

      const result = await sendFeedbackToSentry({ comment: 'x', attachLogs: false });

      expect(replay.flush).not.toHaveBeenCalled();
      expect(result).toEqual({ ok: true, eventId: 'event-abc', replayId: undefined });
      expect(getScope()?.setTags.mock.calls[0][0]).toMatchObject({ hasReplay: false });
      expect(getScope()?.setContext).not.toHaveBeenCalled();
    });

    it('flushes/links the replay when attachLogs is true (consent given)', async () => {
      const { Sentry, replay } = makeFakeSentry({ replayId: 'rep-7' });
      w.Sentry = Sentry;

      const result = await sendFeedbackToSentry({ comment: 'x', attachLogs: true });

      expect(replay.flush).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({ ok: true, replayId: 'rep-7' });
    });
  });
});
