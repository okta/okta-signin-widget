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

import { buildInputDescribedByValue } from './buildInputDescribedByValue';

describe('buildInputDescribedByValue Tests', () => {
  it('should not create aria-describedby string when current,  hint, and explain IDs are not provided', () => {
    const currentDescribedByIds = undefined;
    const hintId = undefined;
    const explainId = undefined;

    const updatedDescribedByIds = buildInputDescribedByValue(
      currentDescribedByIds,
      hintId,
      explainId,
    );

    expect(updatedDescribedByIds).toBeUndefined();
  });

  it('should create aria-describedby string with current describedby string when hint / explain IDs do not exist', () => {
    const currentDescribedByIds = 'credentials.passcode-error some-other-element-id';
    const hintId = undefined;
    const explainId = undefined;

    const updatedDescribedByIds = buildInputDescribedByValue(
      currentDescribedByIds,
      hintId,
      explainId,
    );

    expect(updatedDescribedByIds).toBe('credentials.passcode-error some-other-element-id');
  });

  it('should create aria-describedby string with current describedby and hint strings when explain ID does not exist', () => {
    const currentDescribedByIds = 'credentials.passcode-error some-other-element-id';
    const hintId = 'credentials.passcode-hint';
    const explainId = undefined;

    const updatedDescribedByIds = buildInputDescribedByValue(
      currentDescribedByIds,
      hintId,
      explainId,
    );

    expect(updatedDescribedByIds).toBe('credentials.passcode-error some-other-element-id credentials.passcode-hint');
  });

  it('should create aria-describedby string with current describedby, hint, and explain strings', () => {
    const currentDescribedByIds = 'credentials.passcode-error some-other-element-id';
    const hintId = 'credentials.passcode-hint';
    const explainId = 'credentials.passcode-explain';

    const updatedDescribedByIds = buildInputDescribedByValue(
      currentDescribedByIds,
      hintId,
      explainId,
    );

    expect(updatedDescribedByIds)
      .toBe('credentials.passcode-error some-other-element-id credentials.passcode-hint credentials.passcode-explain');
  });
});
