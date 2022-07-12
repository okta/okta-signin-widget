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

import { IdxActionParams, IdxTransaction, NextStep } from '@okta/okta-auth-js';
import {
  useEffect, useMemo, useRef, useState,
} from 'preact/hooks';

import { IDX_STEP } from '../constants';
import { WidgetOptions } from '../types';

const DEFAULT_TIMEOUT = 4000;
const POLL_STEPS = [
  IDX_STEP.CHALLENGE_POLL,
  IDX_STEP.DEVICE_CHALLENGE_POLL,
  IDX_STEP.ENROLL_POLL,
  IDX_STEP.POLL,
];

const getPollingStep = (
  transaction: IdxTransaction | undefined,
): NextStep | undefined => {
  // auth-js preserves polling object (cache) in transaction when back to authenticators list
  // stop polling in this scenario
  if (!transaction || transaction.nextStep?.name.startsWith('select-authenticator')) {
    return undefined;
  }

  const { nextStep = {}, availableSteps = [] } = transaction;
  const pollingStep = ([...availableSteps, nextStep] as NextStep[])
    .find((step: NextStep) => step.name === 'poll' || step.name?.endsWith('-poll'));

  if (!pollingStep) {
    return undefined;
  }

  return pollingStep;
};

// returns polling transaction or undefined
export const usePolling = (
  idxTransaction: IdxTransaction | undefined,
  widgetProps: Partial<WidgetOptions>,
  data: Record<string, unknown>,
): IdxTransaction | undefined => {
  const { stateToken, authClient } = widgetProps;
  const [transaction, setTransaction] = useState<IdxTransaction | undefined>();
  const timerRef = useRef<NodeJS.Timeout>();

  const pollingStep = useMemo(() => {
    const idxTransactionPollingStep = getPollingStep(idxTransaction);
    if (!idxTransactionPollingStep) {
      return undefined;
    }

    const res = getPollingStep(transaction) || idxTransactionPollingStep;
    return res;
  }, [idxTransaction, transaction]);

  // start polling timer when internal polling transaction changes
  useEffect(() => {
    if (!pollingStep) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setTransaction(undefined);
      return undefined;
    }

    const { name, refresh = DEFAULT_TIMEOUT } = pollingStep;

    // one time request
    // the following polling requests will be triggered based on idxTransaction update
    timerRef.current = setTimeout(async () => {
      // TODO: Revert to use action once this fix is completed OKTA-512706
      let payload: IdxActionParams = {};
      if (data.autoChallenge !== undefined) {
        payload.autoChallenge = data.autoChallenge as boolean;
      }
      // POLL_STEPS are not an action, so must treat as such
      if (POLL_STEPS.includes(name)) {
        payload.step = name;
      } else {
        payload = { actions: [{ name, params: payload }] };
      }
      const newTransaction = await authClient?.idx.proceed({
        stateHandle: stateToken && idxTransaction?.context?.stateHandle,
        ...payload,
      });
      setTransaction(newTransaction);
    }, refresh);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTransaction, pollingStep]);

  return transaction;
};
