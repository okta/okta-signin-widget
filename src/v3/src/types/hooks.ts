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

import { IdxAuthenticator, IdxContext, NextStep } from '@okta/okta-auth-js';

import { EventContext, HookDefinition as BaseHookDefinition, HookFunction } from '../../../types';
import type { loc } from '../util/locUtil';
import { FormBag } from './schema';
import { UserInfo } from './userInfo';

export interface DeviceEnrollment {
  name: string;
  platform: string;
  vendor?: string;
  signInUrl?: string;
  enrollmentLink?: string;
  challengeMethod?: string;
  orgName?: string;
}

export type SafeFormBag = Omit<FormBag, 'dataSchema'>;

export interface TransformHookContext extends EventContext {
  formBag: SafeFormBag;
  currentAuthenticator?: IdxAuthenticator;
  userInfo?: UserInfo;
  deviceEnrollment?: DeviceEnrollment;
  nextStep?: NextStep;
  idxContext?: IdxContext;
  loc: typeof loc,
}

export interface TransformHookFunction {
  (context: TransformHookContext): void;
}

export interface HookDefinition extends BaseHookDefinition {
  afterTransform?: TransformHookFunction[];
  beforeAll?: string;
}

export type HookType = keyof HookDefinition;

export interface HooksOptions {
  [name: string]: HookDefinition;
}

export interface FormHooksMap extends Map<string, HookFunction[]> {
  get(k: 'afterTransform'): TransformHookFunction[];
  get(k: string): HookFunction[];
}

export type HooksMap = Map<string, FormHooksMap>;
