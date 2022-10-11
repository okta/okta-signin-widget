/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */
import { UnknownFn } from './types';

export function parseUrlParams(url: string): Record<string, string> {
  // new URL is not supported in IE11
  const params: Record<string, string> = {};
  url.replace(/[?&]+([^=&]+)=([^&]*)/gi,
    function(_, key, value) {
        return params[key] = decodeURIComponent(value);
    });
  return params;
}

export function htmlString(obj: Record<string, string>): string {
  return JSON.stringify(obj, null, 2).replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;');
}

export function toQueryString(obj: Record<string, string>): string {
  const str = [];
  if (obj !== null) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) &&
      
          obj[key] !== undefined &&
          obj[key] !== null) {
        str.push(key + '=' + encodeURIComponent(obj[key]));
      }
    }
  }
  if (str.length) {
    return '?' + str.join('&');
  } else {
    return '';
  }
}

export function removeNils(obj: any) {
  const cleaned = {} as any;
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      const value = obj[prop];
      if (value !== null && value !== undefined) {
        cleaned[prop] = value;
      }
    }
  }
  return cleaned;
}

export function makeClickHandler(fn: UnknownFn): UnknownFn {
  return function(event: Event) {
    event && event.preventDefault(); // prevent navigation / page reload
    return fn();
  };
}

export async function loadScript(id: string, url: string) {
  return new Promise((resolve, reject) => {
    const scriptTag = document.createElement('script');
    scriptTag.src = url;
    scriptTag.id = 'widget-bundle';
    scriptTag.async = true;
    scriptTag.addEventListener('load', () => {
      resolve(scriptTag);
    });
    scriptTag.addEventListener('error', (err) => {
      reject(err);
    });
    document.body.appendChild(scriptTag);
  });
}

export async function loadWidgetScript(bundle: string, minified: boolean) {
  const existingEl = document.getElementById('widget-bundle') as HTMLScriptElement;

  let url = `${window.location.origin}/js/okta-sign-in`;
  if (bundle !== 'default') {
    url += `.${bundle}`;
  }
  if (minified) {
    url += '.min';
  }
  url += '.js';

  if (!existingEl || existingEl.src !== url) {
    existingEl && existingEl.parentElement.removeChild(existingEl);

    await loadScript('widget-bundle', url);
  }
}
