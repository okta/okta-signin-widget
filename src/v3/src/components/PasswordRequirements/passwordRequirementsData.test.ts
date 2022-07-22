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

import { PASSWORD_REQUIREMENTS_KEYS } from '../../constants';
import {
  AgeRequirements,
  ComplexityRequirements,
} from '../../types';
import {
  getAgeItems,
  getComplexityItems,
} from './passwordRequirementsData';

jest.mock('okta', () => ({
  loc: jest.fn().mockImplementation(
    (key, bundle) => key,
  ),
}));

describe('getComplexityItems', () => {
  it('should return excludeFirstName item', () => {
    const complexity = {
      excludeAttributes: ['firstName'],
    } as unknown as ComplexityRequirements;

    const result = getComplexityItems(complexity);
    expect(result).toEqual([{ ruleKey: 'firstName', label: PASSWORD_REQUIREMENTS_KEYS.complexity.excludeFirstName }]);
  });

  it('should return excludeLastName item', () => {
    const complexity = {
      excludeAttributes: ['lastName'],
    } as unknown as ComplexityRequirements;

    const result = getComplexityItems(complexity);
    expect(result).toEqual([{ ruleKey: 'lastName', label: PASSWORD_REQUIREMENTS_KEYS.complexity.excludeLastName }]);
  });

  it('should return minLength item with value', () => {
    const complexity = {
      minLength: 5,
    } as unknown as ComplexityRequirements;

    const result = getComplexityItems(complexity);
    expect(result).toEqual([{ ruleKey: 'minLength', label: PASSWORD_REQUIREMENTS_KEYS.complexity.minLength }]);
  });

  it('should not return items, if value < 1 or false', () => {
    const complexity = {
      minLength: 0,
      excludeUsername: false,
    } as unknown as ComplexityRequirements;

    const result = getComplexityItems(complexity);
    expect(result).toEqual([]);
  });

  it('should return items', () => {
    const complexity = {
      minLowerCase: 1,
      minNumber: 1,
      minSymbol: 1,
    } as unknown as ComplexityRequirements;

    const result = getComplexityItems(complexity);
    expect(result).toEqual([
      { ruleKey: 'minLowerCase', label: PASSWORD_REQUIREMENTS_KEYS.complexity.minLowerCase },
      { ruleKey: 'minNumber', label: PASSWORD_REQUIREMENTS_KEYS.complexity.minNumber },
      { ruleKey: 'minSymbol', label: PASSWORD_REQUIREMENTS_KEYS.complexity.minSymbol },
    ]);
  });
});

describe('getAgeItems', () => {
  it('should return historyCount item with value', () => {
    const age = {
      historyCount: 5,
    } as unknown as AgeRequirements;

    const result = getAgeItems(age);
    expect(result).toEqual([{ ruleKey: 'historyCount', label: PASSWORD_REQUIREMENTS_KEYS.age.historyCount }]);
  });

  it('should return minAgeMinutes as minutes', () => {
    const age = {
      minAgeMinutes: 40,
    } as unknown as AgeRequirements;

    const result = getAgeItems(age);
    expect(result).toEqual([
      { ruleKey: 'minAgeMinutes', label: PASSWORD_REQUIREMENTS_KEYS.age.minAgeMinutes },
    ]);
  });

  it('should return minAgeMinutes as hours', () => {
    const age = {
      minAgeMinutes: 120,
    } as unknown as AgeRequirements;

    const result = getAgeItems(age);
    expect(result).toEqual([
      { ruleKey: 'minAgeMinutes', label: PASSWORD_REQUIREMENTS_KEYS.age.minAgeHours },
    ]);
  });

  it('should return minAgeMinutes as days', () => {
    const age = {
      minAgeMinutes: 2880,
    } as unknown as AgeRequirements;

    const result = getAgeItems(age);
    expect(result).toEqual([
      { ruleKey: 'minAgeMinutes', label: PASSWORD_REQUIREMENTS_KEYS.age.minAgeDays },
    ]);
  });
});
