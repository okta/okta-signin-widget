/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import Cookies from 'js-cookie';

const DEFAULT_EXPIRY_DAYS = 365;
const DEFAULT_COOKIE_PATH = '/';
const LAST_USERNAME_COOKIE_NAME = 'ln';

export const setCookieString = (
  name: string,
  value: string,
  expiryDays?: number,
  path?: string,
): void => {
  Cookies.set(
    name,
    value,
    { expires: expiryDays ?? DEFAULT_EXPIRY_DAYS, path: path ?? DEFAULT_COOKIE_PATH },
  );
};

export const getCookieString = (name: string): string => Cookies.get(name) as string;

export const removeCookie = (name: string): void => Cookies.remove(name);

export const setUsernameCookie = (username: string): void => setCookieString(
  LAST_USERNAME_COOKIE_NAME,
  username,
);

export const getUsernameCookie = (): string => getCookieString(LAST_USERNAME_COOKIE_NAME);

export const removeUsernameCookie = (): void => removeCookie(LAST_USERNAME_COOKIE_NAME);
