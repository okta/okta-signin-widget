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

import { useOnJoinAriaDescribedBy } from './useOnJoinAriaDescribedBy';

describe('useOnJoinAriaDescribedBy Hook Tests', () => {
  it('should return undefined aria-describedby prop when no parameters are provided', () => {
    const updatedDescribedByIds = useOnJoinAriaDescribedBy();

    expect(updatedDescribedByIds).toEqual({ 'aria-describedby': undefined });
  });

  it('should create aria-describedby string with one parameter', () => {
    const currentDescribedByIds = 'credentials.passcode-error some-other-element-id';

    const updatedDescribedByIds = useOnJoinAriaDescribedBy(currentDescribedByIds);

    expect(updatedDescribedByIds)
      .toEqual({ 'aria-describedby': 'credentials.passcode-error some-other-element-id' });
  });

  it('should create combined aria-describedby string with two parameters', () => {
    const currentDescribedByIds = 'credentials.passcode-error some-other-element-id';
    const hintId = 'credentials.passcode-hint';

    const updatedDescribedByIds = useOnJoinAriaDescribedBy(
      currentDescribedByIds,
      hintId,
    );

    expect(updatedDescribedByIds).toEqual({
      'aria-describedby': 'credentials.passcode-error some-other-element-id credentials.passcode-hint',
    });
  });

  it('should create combined aria-describedby string with three parameters', () => {
    const currentDescribedByIds = 'credentials.passcode-error some-other-element-id';
    const hintId = 'credentials.passcode-hint';
    const explainId = 'credentials.passcode-explain';

    const updatedDescribedByIds = useOnJoinAriaDescribedBy(
      currentDescribedByIds,
      hintId,
      explainId,
    );

    expect(updatedDescribedByIds)
      .toEqual({
        'aria-describedby': 'credentials.passcode-error some-other-element-id credentials.passcode-hint credentials.passcode-explain',
      });
  });

  it('should create combined aria-describedby string with multiple parameters of mixed types', () => {
    const currentDescribedByIds = undefined;
    const hintId = undefined;
    const explainId = 'credentials.passcode-explain';
    const someOtherId = 'someOtherId';

    const updatedDescribedByIds = useOnJoinAriaDescribedBy(
      currentDescribedByIds,
      hintId,
      explainId,
      someOtherId,
    );

    expect(updatedDescribedByIds)
      .toEqual({
        'aria-describedby': 'credentials.passcode-explain someOtherId',
      });
  });
});
