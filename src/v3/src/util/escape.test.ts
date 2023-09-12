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

import { escape } from './escape';

describe('escape function tests', () => {
  it('should return null when string provided is undefined', () => {
    expect(escape()).toBeNull();
  });

  it('should return empty string when empty string is provided', () => {
    expect(escape('')).toBe('');
  });

  it('should convert text with a quote into html entities', () => {
    expect(escape('My Workflow\'s Application')).toBe('My Workflow&#39;s Application');
  });

  it('should convert text with an ampersand into html entities', () => {
    expect(escape('John & Joe\'s Application')).toBe('John &amp; Joe&#39;s Application');
  });
});
