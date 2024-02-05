/*!
 * Copyright (c) 2021, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

export async function executeHookFunctions(functions) {
  for (let i = 0; i < functions.length; i++) {
    await functions[i]();
  }
}

export async function executeHooksBefore(hook) {
  if (!hook || !hook.before || !hook.before.length) {
    return;
  }
  await executeHookFunctions(hook.before);
}

export async function executeHooksAfter(hook) {
  if (!hook || !hook.after || !hook.after.length) {
    return;
  }
  await executeHookFunctions(hook.after);
}

export function mergeHook(hooks, formName, hookToMerge) {
  const existingHook = hooks[formName] = hooks[formName] || { before: [], after: [] };
  if (hookToMerge.before) {
    existingHook.before = (existingHook.before || []).concat(hookToMerge.before);
  }
  if (hookToMerge.after) {
    existingHook.after = (existingHook.after || []).concat(hookToMerge.after);
  }
}
