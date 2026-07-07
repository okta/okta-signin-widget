/*!
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

describe('loadAltcha', () => {
  let loadAltcha: (baseUrl: string) => Promise<void>;
  let appendChildSpy: jest.SpyInstance;

  beforeEach(() => {
    appendChildSpy = jest.spyOn(document.head, 'appendChild').mockImplementation((node) => node);

    // jsdom doesn't provide fetch — define it so the module can call it.
    (window as any).fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('/* worker source */'),
    } as unknown as Response);

    Object.defineProperty(window, 'Worker', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({})),
    });

    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: jest.fn().mockReturnValue('blob:https://okta.com/test-worker'),
    });

    // Fresh module per test — resets the module-scope readyPromise.
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      ({ loadAltcha } = require('../../../../src/util/Altcha'));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as any).altchaCreateWorker;
  });

  function triggerScriptOnload() {
    const script = appendChildSpy.mock.calls[0]?.[0] as HTMLScriptElement;
    (script as any)?.onload?.(new Event('load'));
  }

  function triggerScriptOnerror() {
    const script = appendChildSpy.mock.calls[0]?.[0] as HTMLScriptElement;
    (script as any)?.onerror?.(new Event('error'));
  }

  it('injects a <script type="module"> tag into document.head', async () => {
    const promise = loadAltcha('https://cdn.okta.com');
    triggerScriptOnload();
    await promise;

    const script = appendChildSpy.mock.calls[0][0] as HTMLScriptElement;
    expect(script.tagName).toBe('SCRIPT');
    expect(script.type).toBe('module');
    expect(script.src).toBe('https://cdn.okta.com/altcha.js');
  });

  it('fetches worker.js from the same base URL', async () => {
    const promise = loadAltcha('https://cdn.okta.com');
    triggerScriptOnload();
    await promise;

    expect((window as any).fetch).toHaveBeenCalledWith('https://cdn.okta.com/worker.js');
  });

  it('installs window.altchaCreateWorker after altcha.js loads', async () => {
    const promise = loadAltcha('https://cdn.okta.com');
    triggerScriptOnload();
    await promise;

    expect(typeof window.altchaCreateWorker).toBe('function');
  });

  it('altchaCreateWorker returns a new Worker instance on each call', async () => {
    const promise = loadAltcha('https://cdn.okta.com');
    triggerScriptOnload();
    await promise;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    window.altchaCreateWorker!();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    window.altchaCreateWorker!();

    expect(window.Worker).toHaveBeenCalledTimes(2);
  });

  it('altchaCreateWorker passes the blob URL to Worker', async () => {
    const promise = loadAltcha('https://cdn.okta.com');
    triggerScriptOnload();
    await promise;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    window.altchaCreateWorker!();

    expect(window.Worker).toHaveBeenCalledWith('blob:https://okta.com/test-worker');
  });

  it('creates the blob URL from worker.js source text', async () => {
    const promise = loadAltcha('https://cdn.okta.com');
    triggerScriptOnload();
    await promise;

    expect(URL.createObjectURL).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'application/javascript' }),
    );
  });

  it('is idempotent — returns the same Promise and does not re-fetch on second call', async () => {
    const p1 = loadAltcha('https://cdn.okta.com');
    const p2 = loadAltcha('https://cdn.okta.com');

    expect(p1).toBe(p2);

    triggerScriptOnload();
    await p1;

    expect((window as any).fetch).toHaveBeenCalledTimes(1);
    expect(appendChildSpy).toHaveBeenCalledTimes(1);
  });

  it('rejects if the script fails to load', async () => {
    const promise = loadAltcha('https://cdn.okta.com');
    triggerScriptOnerror();

    await expect(promise).rejects.toThrow('Failed to load script');
  });

  it('resets readyPromise on rejection so a subsequent call can retry', async () => {
    const p1 = loadAltcha('https://cdn.okta.com');
    triggerScriptOnerror();
    await expect(p1).rejects.toThrow();

    appendChildSpy.mockClear();

    const p2 = loadAltcha('https://cdn.okta.com');
    expect(p1).not.toBe(p2);

    triggerScriptOnload();
    await p2;

    expect(appendChildSpy).toHaveBeenCalledTimes(1);
  });

  it('still resolves if worker.js fetch fails (best-effort blob build)', async () => {
    (window as any).fetch = jest.fn().mockRejectedValue(new Error('network error'));

    const promise = loadAltcha('https://cdn.okta.com');
    triggerScriptOnload();

    await expect(promise).resolves.toBeUndefined();
  });

  it('does not install altchaCreateWorker if worker.js fetch fails', async () => {
    (window as any).fetch = jest.fn().mockRejectedValue(new Error('network error'));

    const promise = loadAltcha('https://cdn.okta.com');
    triggerScriptOnload();
    await promise;

    // altcha's own default factory remains — we don't overwrite it
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(window.altchaCreateWorker).toBeUndefined();
  });
});
