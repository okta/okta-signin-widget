/*!
 * Copyright (c) 2021, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

const STATE_HANDLE_SESSION_STORAGE_KEY = 'osw-oie-state-handle';
const LAST_INITIATED_LOGIN_URL_SESSION_STORAGE_KEY = 'osw-oie-last-initiated-login-url';
const RESEND_TIMESTAMP_SESSION_STORAGE_KEY = 'osw-oie-resend-timestamp';

const removeStateHandle = () => {
  sessionStorage.removeItem(STATE_HANDLE_SESSION_STORAGE_KEY);
  sessionStorage.removeItem(LAST_INITIATED_LOGIN_URL_SESSION_STORAGE_KEY);
};
const setStateHandle = (token) => {
  sessionStorage.setItem(STATE_HANDLE_SESSION_STORAGE_KEY, token);
  sessionStorage.setItem(LAST_INITIATED_LOGIN_URL_SESSION_STORAGE_KEY, window.location.href);
};
const getStateHandle = () => {
  return sessionStorage.getItem(STATE_HANDLE_SESSION_STORAGE_KEY);
};
const getLastInitiatedLoginUrl = () => {
  return sessionStorage.getItem(LAST_INITIATED_LOGIN_URL_SESSION_STORAGE_KEY);
};
const removeResendTimestamp = () => {
  sessionStorage.removeItem(RESEND_TIMESTAMP_SESSION_STORAGE_KEY);
};
const setResendTimestamp = (token) => {
  sessionStorage.setItem(RESEND_TIMESTAMP_SESSION_STORAGE_KEY, token);
};
const getResendTimestamp = () => {
  return sessionStorage.getItem(RESEND_TIMESTAMP_SESSION_STORAGE_KEY);
};


export default {
  removeStateHandle,
  setStateHandle,
  getStateHandle,
  getLastInitiatedLoginUrl,
  removeResendTimestamp,
  setResendTimestamp,
  getResendTimestamp
};
