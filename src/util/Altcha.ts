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

declare global {
  interface Window {
    altchaCreateWorker?: () => Worker;
  }
}

let readyPromise: Promise<void> | undefined;

/**
 * Loads the ALTCHA widget script and installs a shared-blob Worker factory.
 *
 * ALTCHA's split (`dist_external`) build spawns up to
 * `min(16, navigator.hardwareConcurrency)` Web Workers for parallel
 * proof-of-work. Its default factory does `new Worker(new URL("./worker.js",
 * import.meta.url))` — one network fetch per Worker instance. We fetch
 * `worker.js` once, wrap it in a Blob URL, and install
 * `window.altchaCreateWorker` so every parallel Worker uses the same blob URL —
 * collapsing N fetches to 1.
 *
 * Idempotent: subsequent calls return the same Promise, so widget remounts
 * (e.g. after `onverified`) do not re-fetch the script or the worker source.
 *
 * Best-effort worker blob: script load is mandatory (Promise rejects if
 * altcha.js can't load), but worker blob build is optional. If the worker fetch
 * or blob construction fails, we resolve anyway — altcha's own default factory
 * will spawn workers, just less efficiently.
 */
export function loadAltcha(baseUrl: string): Promise<void> {
  if (!readyPromise) {
    readyPromise = load(baseUrl).catch((e) => {
      // Reset so a future call can retry (rather than pinning a transient
      // failure for the rest of the session).
      readyPromise = undefined;
      throw e;
    });
  }
  return readyPromise;
}

async function load(baseUrl: string): Promise<void> {
  // Fire both in parallel. Worker fetch is caught locally so a worker fetch
  // failure does NOT fail the whole load — altcha's default factory can still
  // serve as fallback.
  // ALTCHA is guarded off on IE11 (the only browserslist target without fetch)
  // by IdxBotProtectionHelperImpl in okta-core, so this code path never runs
  // on IE11.
  // eslint-disable-next-line compat/compat
  const workerPromise = fetch(`${baseUrl}/worker.js`)
    .then((r) => r.text())
    .catch((): string | undefined => undefined);

  await injectModule(`${baseUrl}/altcha.js`);

  const workerSrc = await workerPromise;
  if (workerSrc !== undefined) {
    const blobUrl = URL.createObjectURL(
      new Blob([workerSrc], { type: 'application/javascript' }),
    );
    // Must run AFTER altcha.js has evaluated (injectModule's onload = module
    // top-level code has executed). altcha.js installs its own default factory
    // at eval time and would clobber an earlier assignment. Classic Worker (no
    // `{ type: 'module' }`) is correct — worker.js is a self-contained IIFE.
    window.altchaCreateWorker = () => new Worker(blobUrl);
  }
}

function injectModule(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}
