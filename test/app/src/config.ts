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


import { parseUrlParams, removeNils, toQueryString } from './util';
import { CALLBACK_PATH, STORAGE_KEY, MOUNT_PATH } from './constants';
import type { WidgetOptions } from '@okta/okta-signin-widget';
import { Config } from './types';
const HOST = window.location.host;
const PROTO = window.location.protocol;
const REDIRECT_URI = `${PROTO}//${HOST}${CALLBACK_PATH}`;


export function formatWidgetOptions(options: WidgetOptions): string{
  return JSON.stringify(options, null, 2);
}

export function getIssuerOrigin(issuer: string): string {
  return issuer?.split('/oauth2/')[0];
}

export function getBaseUrl(options: WidgetOptions): string {
  const baseUrl = options.baseUrl;
  if (baseUrl) {
    return baseUrl;
  }
  const issuer = options.issuer || options.authParams?.issuer;
  if (issuer) {
    return getIssuerOrigin(issuer);
  }
}

export function getIssuer(options: WidgetOptions): string {
  return options.issuer || options.authParams?.issuer;
}

export function getDefaultConfig(): Config {
  const {
    WIDGET_TEST_SERVER,
    WIDGET_SPA_CLIENT_ID,
    BUNDLE, USE_MIN,
    ISSUER, CLIENT_ID,
    DIST_ESM
  } = process.env;

  const bundle = BUNDLE || 'default';
  const useMinBundle = !!USE_MIN;
  const useBundledWidget = !!DIST_ESM;
  const issuer = ISSUER || WIDGET_TEST_SERVER + '/oauth2/default';
  const clientId = CLIENT_ID || WIDGET_SPA_CLIENT_ID;
  const redirectUri = REDIRECT_URI;

  const config: Config = {
    bundle,
    useMinBundle,
    useBundledWidget,
    widgetOptions: {
      issuer,
      clientId,
      redirectUri,
      useClassicEngine: false
    }
  };
  return removeNils(config) as Config;
}

export function extendConfig(baseConfig: Config, extraConfig: Config): Config {
  const widgetOptions = {
    ...baseConfig.widgetOptions,
    ...extraConfig.widgetOptions,
  };
  const config = {
    ...baseConfig,
    ...extraConfig,
    widgetOptions
  };
  return config;
}

// eslint-disable-next-line complexity
export function getConfigFromUrl(): Config {
  const params = parseUrlParams(window.location.href);

  if (!params.config) {
    return;
  }

  let config;
  try {
    config = JSON.parse(params.config);
  } catch (e) { /* ignore errors */ }

  if (!config || Object.keys(config).length === 0) {
    return null;
  }

  return extendConfig(getDefaultConfig(), config as Config);
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
