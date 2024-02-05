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

export const isAndroidOrIOS = (): boolean => isAndroid() || isIOS();

export const getUserAgent = (): string => navigator.userAgent;

export const isWindowsPhone = (userAgent: string): boolean => /windows phone|iemobile|wpdesktop/i.test(userAgent);
