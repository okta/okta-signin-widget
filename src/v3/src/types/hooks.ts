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

import { IdxAuthenticator } from '@okta/okta-auth-js';
import { HookDefinition as BaseHookDefinition, HookFunction, HookType as BaseHookType } from '../../../types';
import { FormBag } from './schema';
import { UserInfo } from './userInfo';

export interface TransformHookContext {
  formName: string;
  currentAuthenticator?: IdxAuthenticator;
  userInfo?: UserInfo;
}

export type TransformHookFunction = (formBag: FormBag, context: TransformHookContext) => void;

export interface TransformHookDefinition {
  afterTransform?: TransformHookFunction[];
}

export type TransformHookType = keyof TransformHookDefinition;

export interface HookDefinition extends BaseHookDefinition, TransformHookDefinition {}

export type HookType = keyof HookDefinition;

export interface HooksOptions {
  [name: string]: HookDefinition;
}

export type AnyHookFunction = TransformHookFunction | HookFunction;

export interface FormHooksMap extends Map<string, AnyHookFunction[]> {
  get(k: BaseHookType): HookFunction[];
  get(k: TransformHookType): TransformHookFunction[];
  get(k: string): AnyHookFunction[];
}

export type AllHooksMap = Map<string, FormHooksMap>;

export type { BaseHookType };
