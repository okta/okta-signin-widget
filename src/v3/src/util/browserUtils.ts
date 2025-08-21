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

export const isAndroid = (): boolean => (
  // Windows Phone also contains "Android"
  /android/i.test(navigator.userAgent)
    && !/windows phone/i.test(navigator.userAgent)
);

export const isIOS = (): boolean => (
  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  /iPad|iPhone|iPod/i.test(navigator.userAgent)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
);

export const supportsChromeLNA = (): boolean => {
  const minVersion = 138;

  const userAgent = navigator.userAgent;
  const match = userAgent.match(/Chrom(?:e|ium)\/([0-9]+)\./);

  if (match && match[1]) {
      const majorVersion = parseInt(match[1], 10);
      if (!isNaN(majorVersion) && majorVersion >= minVersion) {
          return true;
      }
  }

  // If no match is found or the version is too low, return false.
  return false;
}

export const isAndroidOrIOS = (): boolean => isAndroid() || isIOS();
