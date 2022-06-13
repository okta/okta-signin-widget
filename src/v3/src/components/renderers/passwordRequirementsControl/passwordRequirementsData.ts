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

export const PASSWORD_REQUIREMENTS_KEYS = {
  complexity: {
    minLength: 'password.complexity.length.description',
    minLowerCase: 'password.complexity.lowercase.description',
    minUpperCase: 'password.complexity.uppercase.description',
    minNumber: 'password.complexity.number.description',
    minSymbol: 'password.complexity.symbol.description',
    excludeUsername: 'password.complexity.no_username.description',
    excludeFirstName: 'password.complexity.no_first_name.description',
    excludeLastName: 'password.complexity.no_last_name.description',
  },
  age: {
    historyCount: 'password.complexity.history.description',
    minAgeMinutes: 'password.complexity.minAgeMinutes.description',
    minAgeHours: 'password.complexity.minAgeHours.description',
    minAgeDays: 'password.complexity.minAgeDays.description',
  },
};

interface GetAgeFromMinutes {
  unitLabel: string,
  value: number
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

type ComplexityKeys = keyof typeof PASSWORD_REQUIREMENTS_KEYS.complexity;
export type ComplexityRequirements = {
  [key in ComplexityKeys]?: any;
};

type AgeKeys = keyof typeof PASSWORD_REQUIREMENTS_KEYS.age;
export type AgeRequirements = {
  [key in AgeKeys]: any;
};

interface ListItem {
  ruleKey: string;
  label: string;
  value?: string;
}

export type PasswordRequirementStatus = 'incomplete' | 'complete' | 'info';
export type PasswordRequirementProps = {
  status?: PasswordRequirementStatus;
  text: string;
};

export interface PasswordRequirementsData {
  complexity: ComplexityRequirements;
  age: AgeRequirements;
}

export interface PasswordSettings {
  complexity?: {
    minLength?: number;
    minLowerCase?: number;
    minUpperCase?: number;
    minNumber?: number;
    minSymbol?: number;
    excludeUsername?: boolean;
    excludeFirstName?: boolean;
    excludeLastName?: boolean;
    excludeAttributes?: string[];
  };
  age?: {
    historyCount?: number;
    minAgeMinutes?: number;
    minAgeHours?: number;
    minAgeDays?: number;
  };
}

export type PasswordValidation = {
  [key: string]: boolean;
};

export const getComplexityItems = (complexity: ComplexityRequirements): ListItem[] => {
  const items: ListItem[] = [];

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

export const getAgeItems = (age: AgeRequirements): ListItem[] => {
  const items: ListItem[] = [];

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

export const buildPasswordRequirementListItems = (data: PasswordRequirementsData): ListItem[] => {
  const complexityItems = getComplexityItems(data.complexity);
  const ageItems = getAgeItems(data.age);
  return [...complexityItems, ...ageItems];
};
