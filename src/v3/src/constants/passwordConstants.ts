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

export const PASSWORD_REQUIREMENTS_KEYS: Record<'complexity' | 'age', { [key: string]: string }> = {
  complexity: {
    minLength: 'password.complexity.length.description',
    minLowerCase: 'password.complexity.lowercase.description',
    minUpperCase: 'password.complexity.uppercase.description',
    minNumber: 'password.complexity.number.description',
    minSymbol: 'password.complexity.symbol.description',
    excludeUsername: 'password.complexity.no_username.description',
    excludeFirstName: 'password.complexity.no_first_name.description',
    excludeLastName: 'password.complexity.no_last_name.description',
    useADComplexityRequirements: 'password.complexity.adRequirements.description',
  },
  age: {
    minAgeMinutes: 'password.complexity.minAgeMinutes.description',
    minAgeHours: 'password.complexity.minAgeHours.description',
    minAgeDays: 'password.complexity.minAgeDays.description',
  },
};
