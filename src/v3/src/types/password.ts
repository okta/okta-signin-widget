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

import { PASSWORD_REQUIREMENTS_KEYS } from '../constants';

export type PasswordRequirementStatus = 'incomplete' | 'complete' | 'info';
export type PasswordRequirementProps = {
  status: PasswordRequirementStatus;
  label: string;
};

export interface GetAgeFromMinutes {
  unitLabel: string,
  value: number
}

export type ComplexityKeys = keyof typeof PASSWORD_REQUIREMENTS_KEYS.complexity;

export type ComplexityRequirements = {
  [key in ComplexityKeys]?: any;
};

type AgeKeys = keyof typeof PASSWORD_REQUIREMENTS_KEYS.age;
export type AgeRequirements = {
  [key in AgeKeys]?: any;
};

export interface PasswordRequirementsData {
  complexity?: ComplexityRequirements;
  age?: AgeRequirements;
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
    useADComplexityRequirements?: boolean;
  };
  age?: {
    historyCount?: number;
    minAgeMinutes?: number;
    minAgeHours?: number;
    minAgeDays?: number;
  };
  daysToExpiry?: number;
}

export type PasswordValidation = {
  [key: string]: boolean;
};

export interface ListItem {
  ruleKey: string;
  label: string;
}
