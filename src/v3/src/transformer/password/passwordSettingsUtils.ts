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
  ComplexityKeys,
  ComplexityRequirements,
  GetAgeFromMinutes,
  ListItem,
  PasswordSettings,
} from '../../types';
import { loc } from '../../util';

export const getAgeFromMinutes = (minutes: number): GetAgeFromMinutes => {
  const hours = minutes / 60;
  if (hours < 1) {
    return { unitLabel: PASSWORD_REQUIREMENTS_KEYS.age.minAgeMinutes, value: minutes };
  }
  const days = hours / 24;
  if (days < 1) {
    return { unitLabel: PASSWORD_REQUIREMENTS_KEYS.age.minAgeHours, value: Math.ceil(hours) };
  }
  return { unitLabel: PASSWORD_REQUIREMENTS_KEYS.age.minAgeDays, value: Math.ceil(days) };
};

export const getComplexityItems = (complexity?: ComplexityRequirements): ListItem[] => {
  const items: ListItem[] = [];

  if (!complexity) {
    return items;
  }

  let filteredComplexity: ComplexityRequirements = complexity;

  // If useADComplexityRequirements is true, ignore casing, number, and symbol rules since AD validator handles those requirements
  if (complexity.useADComplexityRequirements) {
    filteredComplexity = {
      minLength: complexity.minLength,
      useADComplexityRequirements: complexity.useADComplexityRequirements,
      excludeUsername: complexity.excludeUsername,
      excludeFirstName: complexity.excludeFirstName,
      excludeLastName: complexity.excludeLastName,
      excludeAttributes: complexity.excludeAttributes,
    };
  }

  Object.entries(filteredComplexity).forEach(([key, value]) => {
    if (key === 'excludeAttributes' && Array.isArray(value) && value.length > 0) {
      value
        .filter((rule) => ['username', 'firstName', 'lastName'].includes(rule))
        .forEach((ruleAttr: string) => {
          const ruleExclusionKey = `exclude${ruleAttr.charAt(0).toUpperCase() + ruleAttr.slice(1)}`;
          items.push({
            ruleKey: ruleAttr,
            label: loc(PASSWORD_REQUIREMENTS_KEYS.complexity[ruleExclusionKey], 'login'),
          });
        });
    } else if (key === 'minLength' && value > 0) {
      items.push({
        ruleKey: key,
        label: loc(PASSWORD_REQUIREMENTS_KEYS.complexity[key as ComplexityKeys], 'login', [value]),
      });
    } else if (value > 0 || value === true) {
      const item: ListItem = {
        ruleKey: key,
        label: loc(PASSWORD_REQUIREMENTS_KEYS.complexity[key as ComplexityKeys], 'login'),
      };
      items.push(item);
    }
  });

  return items;
};

export const buildPasswordRequirementListItems = (
  data: PasswordSettings,
): ListItem[] => getComplexityItems(data.complexity);
