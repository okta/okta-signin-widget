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

import { IdxMessage } from '@okta/okta-auth-js';
import clone from 'lodash/clone';
import { useCallback } from 'preact/hooks';

import { useWidgetContext } from '../contexts';
import { WidgetMessage } from '../types';
import { loc, resetMessagesToInputs } from '../util';

export const useOnSubmitValidation = (): (
messages: Record<string, WidgetMessage[]>) => Promise<void> => {
  const {
    setIdxTransaction,
    setIsClientTransaction,
    setMessage,
    idxTransaction: currentTransaction,
  } = useWidgetContext();

  return useCallback(async (messages: Record<string, WidgetMessage[]>) => {
    const newTransaction = clone(currentTransaction);
    resetMessagesToInputs(newTransaction!.nextStep!.inputs!, messages);
    setMessage({
      message: loc('oform.errorbanner.title', 'login'),
      class: 'ERROR',
      i18n: { key: 'oform.errorbanner.title' },
    } as IdxMessage);
    setIsClientTransaction(true);
    setIdxTransaction(newTransaction);
  }, [currentTransaction, setIdxTransaction, setIsClientTransaction, setMessage]);
};
