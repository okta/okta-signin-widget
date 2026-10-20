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

import { fastpassPollingLog, FastpassPollingLogEntry } from './fastpassPollingLog';

const api = () => window.OktaSignInFastPassPollingLog as {
  dump: () => FastpassPollingLogEntry[];
  clear: () => void;
};

describe('fastpassPollingLog', () => {
  beforeEach(() => {
    api().clear();
  });

  afterEach(() => {
    api().clear();
  });

  it('registers the dump/clear accessors on window', () => {
    expect(typeof api().dump).toBe('function');
    expect(typeof api().clear).toBe('function');
  });

  it('appends an entry to the ring buffer', () => {
    fastpassPollingLog('poll tick scheduled', { name: 'challenge-poll', refresh: 4000 });

    const entries = api().dump();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      event: 'poll tick scheduled',
      data: { name: 'challenge-poll', refresh: 4000 },
    });
    expect(typeof entries[0].t).toBe('number');
  });

  it('preserves the drop signature: suppressed with no later scheduled', () => {
    fastpassPollingLog('poll tick scheduled');
    fastpassPollingLog('poll tick fired');
    fastpassPollingLog('poll tick suppressed by in-flight guard (chain not rescheduled)');

    const events = api().dump().map((e) => e.event);
    const lastScheduled = events.lastIndexOf('poll tick scheduled');
    const lastSuppressed = events.findIndex((e) => e.startsWith('poll tick suppressed'));
    // the suppressed entry is the final one — nothing scheduled after it
    expect(lastSuppressed).toBeGreaterThan(lastScheduled);
    expect(lastSuppressed).toBe(events.length - 1);
  });

  it('caps the buffer so it cannot grow without bound', () => {
    for (let i = 0; i < 500; i += 1) {
      fastpassPollingLog('poll tick fired', { i });
    }
    const entries = api().dump();
    expect(entries.length).toBeLessThanOrEqual(200);
    // keeps the most recent entries (tail), which is what the drop signature needs
    expect(entries[entries.length - 1].data).toEqual({ i: 499 });
  });

  it('dump returns a copy, not the live buffer', () => {
    fastpassPollingLog('poll tick fired');
    const first = api().dump();
    first.push({ t: 0, event: 'mutation attempt' });
    expect(api().dump()).toHaveLength(1);
  });

  it('never throws', () => {
    expect(() => fastpassPollingLog('poll tick fired')).not.toThrow();
    expect(() => fastpassPollingLog('x', { a: 1 })).not.toThrow();
  });
});
