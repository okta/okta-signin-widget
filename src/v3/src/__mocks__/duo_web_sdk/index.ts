/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { InitOptions } from 'duo_web_sdk';

const MockDuo = {
  init: (options: InitOptions): void => {
    const iframe: HTMLIFrameElement = (() => {
      if (options.iframe instanceof HTMLIFrameElement) {
        return options.iframe;
      }
      if (typeof options.iframe === 'string') {
        const el = document.querySelector(options.iframe);
        if (el instanceof HTMLIFrameElement) {
          return el;
        }
      }
      throw new Error(`could not find iframe "${options.iframe}"`);
    })();

    if (iframe) {
      iframe.src = '/duo-iframe.html';
      iframe.onload = () => {
        const innerDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
        const duoMockLink = innerDoc?.getElementById('duoVerifyLink');
        duoMockLink?.addEventListener('click', () => {
          if (options.post_action) {
            // @ts-expect-error mistake in @types/duo_web_sdk
            options.post_action('successDuoAuth');
          }
        }, false);
      };
    }
  },
};

export default MockDuo;
