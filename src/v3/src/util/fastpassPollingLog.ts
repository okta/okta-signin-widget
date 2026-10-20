/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/*
 * Log-only diagnostics for the gen3 FastPass loopback poll/cancel lifecycle,
 * to help investigate the "stuck on /authenticator/poll" reports. Never changes
 * control flow.
 *
 * Each event is appended to a bounded in-memory ring buffer. The buffer (rather
 * than console output) is the record because the issue is intermittent and
 * browsers only retain console output while devtools is open — so the customer
 * can reproduce with the console closed and dump afterward:
 *   window.OktaSignInFastPassPollingLog.dump()
 */

// Cap entries so a long-running session cannot grow memory without bound.
const MAX_ENTRIES = 200;

export type FastpassPollingLogEntry = {
  t: number; // ms since navigation start (performance.now)
  event: string;
  data?: Record<string, unknown>;
};

const buffer: FastpassPollingLogEntry[] = [];

const now = (): number => {
  try {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? Math.round(performance.now())
      : 0;
  } catch {
    return 0;
  }
};

type FastpassPollingLogGlobal = {
  dump: () => FastpassPollingLogEntry[];
  clear: () => void;
};

declare global {
  interface Window {
    OktaSignInFastPassPollingLog?: FastpassPollingLogGlobal;
  }
}

// Self-register the dump/clear accessors so they are available in prod without
// depending on the optional OktaSignInDebug plugin (not bundled in gen3).
try {
  if (typeof window !== 'undefined' && !window.OktaSignInFastPassPollingLog) {
    window.OktaSignInFastPassPollingLog = {
      // Return a copy so callers cannot mutate the live buffer.
      dump: () => buffer.slice(),
      clear: () => { buffer.length = 0; },
    };
  }
} catch {
  // window unavailable / frozen — the buffer still records in-memory.
}

/**
 * Record a FastPass polling lifecycle event into the in-memory ring buffer for
 * later dump. Never throws.
 */
export const fastpassPollingLog = (
  event: string,
  data?: Record<string, unknown>,
): void => {
  try {
    buffer.push({ t: now(), event, data });
    if (buffer.length > MAX_ENTRIES) {
      // drop oldest; keep the most recent MAX_ENTRIES
      buffer.splice(0, buffer.length - MAX_ENTRIES);
    }
  } catch {
    // never let diagnostics break the flow
  }
};
