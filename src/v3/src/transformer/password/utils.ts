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

import { PasswordWithConfirmationElement, UISchemaElement } from '../../types';

export const getPasswordMatchingKey = (
  data: Record<string, unknown>,
): string | undefined => {
  if ('credentials.passcode' in data) {
    return 'credentials.passcode';
  }

  if ('credentials.password' in data) {
    return 'credentials.password';
  }

  if ('credentials.newPassword' in data) {
    return 'credentials.newPassword';
  }

  // Should never hit this case as it should be one of values defined above
  return undefined;
};

export const updatePasswordWithConfirmationBtnLabel = (
  elements: UISchemaElement[],
  label: string,
): void => {
  const pwEnrollmentEle = elements.find(
    (element) => element.type === 'PasswordWithConfirmation',
  ) as PasswordWithConfirmationElement;
  if (pwEnrollmentEle) {
    pwEnrollmentEle.options = {
      ...pwEnrollmentEle.options,
      ctaLabel: label,
    };
  }
};
