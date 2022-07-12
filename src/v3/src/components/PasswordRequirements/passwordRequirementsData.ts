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
  ComplexityKeys,
  ComplexityRequirements,
  GetAgeFromMinutes,
  PasswordSettings,
} from '../../types';

interface ListItem {
  ruleKey: string;
  label: string;
  value?: string;
}

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

export const getComplexityItems = (complexity: ComplexityRequirements): ListItem[] => {
  const items: ListItem[] = [];

  if (!complexity) {
    return items;
  }

  Object.entries(complexity).forEach(([key, value]) => {
    if (key === 'excludeAttributes' && value.length > 0) {
      if (value.includes('firstName')) {
        items.push({
          ruleKey: 'firstName',
          label: PASSWORD_REQUIREMENTS_KEYS.complexity.excludeFirstName,
        });
      }
      if (value.includes('lastName')) {
        items.push({
          ruleKey: 'lastName',
          label: PASSWORD_REQUIREMENTS_KEYS.complexity.excludeLastName,
        });
      }
    } else if (value > 0 || value === true) {
      const item: ListItem = {
        ruleKey: key,
        label: PASSWORD_REQUIREMENTS_KEYS.complexity[key as ComplexityKeys],
      };
      if (key === 'minLength') {
        item.value = `${value}`;
      }
      items.push(item);
    }
  });

  return items;
};

export const getAgeItems = (age?: AgeRequirements): ListItem[] => {
  const items: ListItem[] = [];

  if (!age) {
    return items;
  }

  if (age.historyCount > 0) {
    items.push({
      ruleKey: 'historyCount',
      label: PASSWORD_REQUIREMENTS_KEYS.age.historyCount,
      value: `${age.historyCount}`,
    });
  }

  if (age.minAgeMinutes > 0) {
    const { unitLabel, value } = getAgeFromMinutes(age.minAgeMinutes);

    items.push({
      ruleKey: 'minAgeMinutes',
      label: unitLabel,
      value: `${value}`,
    });
  }

  return items;
};

export const buildPasswordRequirementListItems = (data: PasswordSettings): ListItem[] => {
  const complexityItems = getComplexityItems(data.complexity!);
  const ageItems = getAgeItems(data.age);
  return [...complexityItems, ...ageItems];
};
