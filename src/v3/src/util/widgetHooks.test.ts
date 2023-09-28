/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
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

import { getStubTransaction } from '../mocks/utils/utils';
import { WidgetHooks } from './widgetHooks';

describe('WidgetHooks', () => {
  it('can construct instance of WidgetHooks from "hooks" in widget options', () => {
    const hooksOptions = {
      terminal: {
        before: [
          jest.fn().mockResolvedValue(undefined),
          jest.fn().mockResolvedValue(undefined),
        ],
        after: [
          jest.fn().mockResolvedValue(undefined),
        ],
      },
      'success-redirect': {
        before: [
          jest.fn().mockResolvedValue(undefined),
        ],
      },
    };
    const hooksInstance = new WidgetHooks(hooksOptions);
    expect(hooksInstance).toEqual({
      hooks: new Map(Object.entries({
        terminal: new Map(Object.entries({
          before: hooksOptions.terminal.before,
          after: hooksOptions.terminal.after,
        })),
        'success-redirect': new Map(Object.entries({
          before: hooksOptions['success-redirect'].before,
        })),
      })),
    });
  });

  it('can add hooks with .addHook()', () => {
    const hooksOptions = {
      terminal: {
        before: [
          jest.fn().mockResolvedValue(undefined),
          jest.fn().mockResolvedValue(undefined),
        ],
      },
    };
    const hooksInstance = new WidgetHooks(hooksOptions);
    const beforeTerminalHook = jest.fn().mockResolvedValue(undefined);
    const afterTerminalHook = jest.fn().mockResolvedValue(undefined);
    const afterSuccessHook = jest.fn().mockResolvedValue(undefined);
    hooksInstance.addHook('before', 'terminal', beforeTerminalHook);
    hooksInstance.addHook('after', 'terminal', afterTerminalHook);
    hooksInstance.addHook('after', 'success-redirect', afterSuccessHook);
    expect(hooksInstance).toEqual({
      hooks: new Map(Object.entries({
        terminal: new Map(Object.entries({
          before: [
            ...hooksOptions.terminal.before,
            beforeTerminalHook,
          ],
          after: [
            afterTerminalHook,
          ],
        })),
        'success-redirect': new Map(Object.entries({
          after: [
            afterSuccessHook,
          ],
        })),
      })),
    });
  });

  it('can execute hooks with .callHooks(hookType, idxTransaction)', async () => {
    const hook1 = jest.fn().mockResolvedValue(undefined);
    const hook2 = jest.fn().mockResolvedValue(undefined);
    const hook3 = jest.fn().mockResolvedValue(undefined);
    const hooksOptions = {
      identify: {
        before: [
          hook1,
          hook2,
        ],
        after: [
          hook3,
        ],
      },
    };
    const hooksInstance = new WidgetHooks(hooksOptions);
    const transactionIdentify = {
      ...getStubTransaction(),
      nextStep: { name: 'identify' },
    } as IdxTransaction;
    await expect(hooksInstance.callHooks('before', transactionIdentify)).resolves.toEqual(undefined);
    expect(hook1).toHaveBeenCalledTimes(1);
    expect(hook2).toHaveBeenCalledTimes(1);
    expect(hook3).not.toHaveBeenCalled();
  });

  it('should get correct form name from idxTransaction argument of .callHooks()', async () => {
    const hookSuccess = jest.fn().mockResolvedValue(undefined);
    const hookTerminal = jest.fn().mockResolvedValue(undefined);
    const hooksOptions = {
      'success-redirect': {
        before: [
          hookSuccess,
        ],
      },
      terminal: {
        before: [
          hookTerminal,
        ],
      },
    };
    const hooksInstance = new WidgetHooks(hooksOptions);
    const stubTransaction = getStubTransaction();
    const transactionSuccess = {
      ...stubTransaction,
      neededToProceed: [],
      context: {
        ...stubTransaction.context,
        success: {
          name: 'success-redirect',
          href: 'http://localhost:3000/app/UserHome?stateToken=mockedStateToken123',
        },
      },
    } as IdxTransaction;
    await expect(hooksInstance.callHooks('before', transactionSuccess)).resolves.toEqual(undefined);
    expect(hookSuccess).toHaveBeenCalledTimes(1);
    expect(hookTerminal).not.toHaveBeenCalled();

    const transactionTerminal = {
      ...stubTransaction,
      neededToProceed: [],
      context: {
        ...stubTransaction.context,
        messages: {
          type: 'array',
          value: [{
            message: 'Some message',
            class: 'ERROR',
            i18n: { key: 'some.key' },
          }],
        },
      },
    } as IdxTransaction;
    await expect(hooksInstance.callHooks('before', transactionTerminal)).resolves.toEqual(undefined);
    expect(hookTerminal).toHaveBeenCalledTimes(1);
  });

  it('can execute hooks for terminal page with .callHooks(hookType, undefined)', async () => {
    const hook1 = jest.fn().mockResolvedValue(undefined);
    const hook2 = jest.fn().mockResolvedValue(undefined);
    const hooksOptions = {
      terminal: {
        before: [
          hook1,
          hook2,
        ],
      },
    };
    const hooksInstance = new WidgetHooks(hooksOptions);
    await expect(hooksInstance.callHooks('before', undefined)).resolves.toEqual(undefined);
    expect(hook1).toHaveBeenCalledTimes(1);
    expect(hook2).toHaveBeenCalledTimes(1);
  });
});
