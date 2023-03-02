/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* global Uint8Array, atob, btoa */

const fn = {};

/**
 * Light weight hashing algorithm that hashes string into an integer between 0 and 4294967295
 * Not recommended for data set of size greater than 10000
 * https://www.npmjs.com/package/string-hash
 *
 * @param str the string to be hashed
 * @returns string hash of integer type
 */
fn.getStringHash = function(str) {
  let hash = 5381;
  let i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  return hash >>> 0;
};

/**
 * Converts any url safe characters in a base64 string to regular base64 characters
 * @param str base64 string that might contain url safe characters
 * @returns base64 formatted string
 */
fn.base64UrlSafeToBase64 = function(str) {
  return str.replace(new RegExp('_', 'g'), '/').replace(new RegExp('-', 'g'), '+');
};

/**
 * Converts an ArrayBuffer object that contains binary data to base64 encoded string
 * @param bin ArrayBuffer object
 * @returns base64 encoded string
 */
fn.binToStr = function(bin) {
  return btoa(new Uint8Array(bin).reduce((s, byte) => s + String.fromCharCode(byte), ''));
};

/**
 * Converts base64 string to binary data view
 * @param str in base64 or base64UrlSafe format
 * @returns converted Uint8Array view of binary data
 */
fn.strToBin = function(str) {
  return Uint8Array.from(atob(this.base64UrlSafeToBase64(str)), c => c.charCodeAt(0));
};

export default fn;
