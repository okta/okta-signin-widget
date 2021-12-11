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


import { removeNils, toQueryString } from '@okta/okta-auth-js';
import { Config } from './types';
import { CALLBACK_PATH, STORAGE_KEY, MOUNT_PATH } from './constants';
const HOST = window.location.host;
const PROTO = window.location.protocol;
const REDIRECT_URI = `${PROTO}//${HOST}${CALLBACK_PATH}`;


export function configToString(config: Config): string{
  return JSON.stringify(config, null, 2);
}

export function getIssuerOrigin(issuer: string): string {
  return issuer?.split('/oauth2/')[0];
}

export function getBaseUrl(config: Config): string {
  const baseUrl = config.baseUrl;
  if (baseUrl) {
    return baseUrl;
  }
  const issuer = config.issuer || config.authParams?.issuer;
  if (issuer) {
    return getIssuerOrigin(issuer);
  }
}

export function getIssuer(config: Config): string {
  return config.issuer || config.authParams?.issuer;
}

export function getDefaultConfig(): Config {
  const ISSUER = process.env.ISSUER || '<baseUrl>/oauth2/default';
  const CLIENT_ID = process.env.CLIENT_ID;

  const config: Config = {
    issuer: ISSUER,
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    useInteractionCodeFlow: true
  };
  return removeNils(config) as Config;
}

// eslint-disable-next-line complexity
export function getConfigFromUrl(): Config {
  const url = new URL(window.location.href);
  const configJSON = url.searchParams.get('config');
  let config;
  try {
    config = JSON.parse(configJSON);
  } catch (e) { /* ignore errors */ }

  if (!config || !config.baseUrl) {
    return null;
  }

  return config as Config;
}

export function updateConfigInUrl(config: Config): void {
  const queryParams = toQueryString({
    config: JSON.stringify(config)
  });
  const originalUrl = MOUNT_PATH + queryParams;
  history.pushState({}, '', originalUrl);
}

export function saveConfigToStorage(config: Config): void {
  const configCopy: Record<string, never> = {};
  Object.keys(config).forEach(key => {
    if (typeof (config as never)[key] !== 'function') {
      configCopy[key] = (config as never)[key];
    }
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configCopy));
}

export function getConfigFromStorage(): Config {
  const storedValue = localStorage.getItem(STORAGE_KEY);
  if (!storedValue) {
    return null;
  }
  const config = JSON.parse(storedValue);
  return config;
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getConfig(): Config {
  const urlConfig = getConfigFromUrl();
  if (urlConfig) {
    return urlConfig;
  }
  const storedConfig = getConfigFromStorage();
  if (storedConfig) {
    return storedConfig;
  }
  return getDefaultConfig();
}

export function resetConfig(): void {
  clearStorage();
  window.location.replace('/');
}
