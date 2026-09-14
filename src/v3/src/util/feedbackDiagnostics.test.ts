/*
 * Copyright (c) 2024-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { IdxTransaction } from '@okta/okta-auth-js';

import { IWidgetContext } from '../types';
import {
  buildDiagnosticBundle,
  installFetchTap,
  recordTransaction,
  resetDiagnostics,
} from './feedbackDiagnostics';

// Keep getEventContext deterministic — its internals aren't under test here.
jest.mock('./getEventContext', () => ({
  getEventContext: jest.fn((txn?: IdxTransaction) => ({
    controller: null,
    formName: txn ? 'challenge-authenticator' : 'terminal',
    authenticatorKey: 'okta_email',
    methodType: 'email',
  })),
}));

const makeTransaction = (overrides: Partial<IdxTransaction> = {}): IdxTransaction => ({
  status: 'TERMINAL',
  requestDidSucceed: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: [{ message: 'boom', class: 'ERROR', i18n: { key: 'idx.error.boom' } }] as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: {} as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  neededToProceed: [] as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawIdxState: { stateHandle: 'FAKE-STATE-HANDLE', messages: {} } as any,
  ...overrides,
} as IdxTransaction);

const makeCtx = (txn: IdxTransaction): IWidgetContext => ({
  idxTransaction: txn,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  widgetProps: { baseUrl: 'https://acme.okta.com', flow: 'default', clientId: 'client-123' } as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

describe('feedbackDiagnostics', () => {
  beforeEach(() => {
    resetDiagnostics();
  });

  it('records a lean per-transaction entry (no payloads by default)', () => {
    const txn = makeTransaction();
    recordTransaction(txn);
    const bundle = buildDiagnosticBundle(makeCtx(txn));

    expect(bundle.transactions).toHaveLength(1);
    expect(bundle.transactions[0]).toMatchObject({
      seq: 0,
      step: 'challenge-authenticator',
      idxStatus: 'TERMINAL',
      requestDidSucceed: false,
      messageKeys: ['idx.error.boom'],
    });
    // no raw response unless explicitly requested
    expect(bundle.transactions[0].rawResponse).toBeUndefined();
    expect(bundle.config).toMatchObject({ issuerOrigin: 'https://acme.okta.com', clientId: 'client-123' });
    expect(bundle.widget.engine).toBe('gen3');
  });

  it('collapses consecutive identical (poll) steps into one entry with a count', () => {
    const txn = makeTransaction();
    recordTransaction(txn);
    recordTransaction(makeTransaction());
    recordTransaction(makeTransaction());
    const bundle = buildDiagnosticBundle(makeCtx(txn));

    expect(bundle.transactions).toHaveLength(1);
    expect(bundle.transactions[0].count).toBe(3);
  });

  it('captures the full raw response per transaction when includeRaw is on', () => {
    const txn = makeTransaction();
    recordTransaction(txn, { includeRaw: true });
    const bundle = buildDiagnosticBundle(makeCtx(txn));

    expect(bundle.transactions).toHaveLength(1);
    // full raw response preserved verbatim (incl. fields to be scrubbed later)
    expect(bundle.transactions[0].rawResponse).toBe(txn.rawIdxState);
  });

  it('captures request URL + payload (incl /idp/idx/introspect) via the fetch tap', async () => {
    // jsdom has no fetch by default — provide a stub the tap can wrap
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fetch = jest.fn(async () => ({ status: 200 }));
    installFetchTap();
    await window.fetch('https://acme.okta.com/idp/idx/introspect', {
      method: 'POST',
      body: JSON.stringify({ stateHandle: 'abc' }),
    });

    recordTransaction(makeTransaction(), { includeRaw: true });
    const bundle = buildDiagnosticBundle(makeCtx(makeTransaction()));

    expect(bundle.transactions[0]).toMatchObject({
      requestUrl: 'https://acme.okta.com/idp/idx/introspect',
      method: 'POST',
      httpStatus: 200,
      requestBody: { stateHandle: 'abc' },
    });
  });

  it('persists the trail across page loads via sessionStorage', () => {
    recordTransaction(makeTransaction());
    const stored = window.sessionStorage.getItem('osw-feedback-diagnostics');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored as string).transactions).toHaveLength(1);
  });
});
