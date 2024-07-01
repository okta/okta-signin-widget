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

import { IdxTransaction } from '@okta/okta-auth-js';

import { HookFunction } from '../../../types';
import {
  AllHooksMap, BaseHookType, FormHooksMap, HooksOptions, HookType, TransformHookContext,
  TransformHookFunction,
} from '../types/hooks';
import { FormBag } from '../types/schema';
import { getFormNameForTransaction } from './getEventContext';

const hookTypes: HookType[] = ['before', 'after', 'afterTransform'];

export class WidgetHooks {
  private hooks: AllHooksMap;

  /* eslint-disable no-restricted-syntax */
  constructor(hooksOptions?: HooksOptions) {
    this.hooks = new Map();
    if (hooksOptions) {
      for (const [formName, formHooks] of Object.entries(hooksOptions)) {
        for (const hookType of hookTypes) {
          for (const hook of (formHooks[hookType] || [])) {
            this.addHook(hookType, formName, hook);
          }
        }
      }
    }
  }

  public addHook(hookType: HookType, formName: string, hook: TransformHookFunction | HookFunction) {
    const formHooks: FormHooksMap = this.hooks.get(formName) || new Map();
    const hooksByType = formHooks.get(hookType) || [];
    hooksByType.push(hook);
    formHooks.set(hookType, hooksByType);
    this.hooks.set(formName, formHooks);
  }

  /* eslint-disable no-await-in-loop */
  public async callHooks(
    hookType: BaseHookType,
    idxTransaction?: IdxTransaction,
  ): Promise<void> {
    const formName = getFormNameForTransaction(idxTransaction);
    if (formName) {
      const hooksToExecute = this.hooks.get(formName)?.get(hookType) || [];
      for (const hook of hooksToExecute) {
        await hook();
      }
    }
  }

  public transformFormBagWithHooks(
    formBag: FormBag,
    idxTransaction?: IdxTransaction,
  ) {
    const idxContext = idxTransaction?.context;
    const currentAuthenticator = idxContext?.currentAuthenticator?.value;
    const currentAuthenticatorEnrollment = idxContext?.currentAuthenticatorEnrollment?.value;
    const formName = getFormNameForTransaction(idxTransaction);
    if (!formName || !formBag.uischema.elements.length) {
      // initial loading state
      return;
    }
    const userInfo = idxContext?.user?.value;
    const context: TransformHookContext = {
      formName,
      userInfo,
      currentAuthenticator: currentAuthenticator ?? currentAuthenticatorEnrollment,
    };
    const hooksToExecute = [
      ...(this.hooks.get(formName)?.get('afterTransform') || []),
      ...(this.hooks.get('*')?.get('afterTransform') || []),
    ];
    for (const hook of hooksToExecute) {
      hook(formBag, context);
    }
  }
}
