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

import { FormBag, UserInfo } from '../types';

export const getUserProvidedUserInfo = (data: FormBag['data']): UserInfo => {
  const identifier = ('userProfile.login' in data
    ? data['userProfile.login']
    : data['userProfile.email']) as string;
  const firstName = 'userProfile.firstName' in data
    ? data['userProfile.firstName'] as string
    : undefined;
  const lastName = 'userProfile.lastName' in data
    ? data['userProfile.lastName'] as string
    : undefined;

  return {
    identifier,
    profile: {
      firstName,
      lastName,
    },
  };
};
