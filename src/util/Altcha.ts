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

// Public entry point. Idempotent via `readyPromise` so widget remounts reuse
// the same load; resets on rejection so retries can succeed.
export function loadAltcha(baseUrl: string): Promise<void> {
  if (!readyPromise) {
    readyPromise = load(baseUrl).catch((e) => {
      readyPromise = undefined;
      throw e;
    });
  }
  return readyPromise;
}

// The actual work: fetch worker.js in parallel with the altcha.js script
// load, then install a blob-URL factory so all parallel PoW workers share
// one worker.js fetch. Best-effort — resolves even if the worker blob step
// fails (altcha's own per-instance-fetch factory takes over).
async function load(baseUrl: string): Promise<void> {
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
    window.altchaCreateWorker = () => new Worker(blobUrl);
  }
}

// Promise-wraps a <script type="module"> injection. Resolves on onload,
// rejects on onerror. Kept separate so the load flow reads linearly.
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
