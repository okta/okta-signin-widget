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
import cloneDeep from 'lodash/cloneDeep';
import {
  useEffect, useMemo, useRef, useState,
} from 'preact/hooks';

import { TERMINAL_KEY } from '../constants';
import { FormBag, WidgetOptions } from '../types';
import { containsMessageKey, isPollingStep } from '../util';

const DEFAULT_TIMEOUT = 4000;

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

const getAutoChallengeValue = (
  transaction: IdxTransaction | undefined,
  data: FormBag['data'],
): boolean | undefined => {
  const { nextStep: { inputs = [] } = {} } = transaction || {};
  const preSelectedAutoChallenge = inputs?.find((input) => input.name === 'autoChallenge')?.value;
  return preSelectedAutoChallenge !== undefined || data.autoChallenge !== undefined
    ? (data.autoChallenge ?? preSelectedAutoChallenge) as boolean
    : undefined;
};

/**
 * usePolling
 *
 * Manages an IDX polling lifecycle with two-track approach:
 * 1. Internal polling state for components that need to react to intermediate changes
 * 2. Stable state for UI rendering to avoid unnecessary re-renders
 *
 * Logic:
 * Detects a polling step on the incoming (external) idxTransaction.
 *   If found, starts/restarts an internal polling chain (pollTransaction).
 *   If not found, clears both transactions to respect external idxTransaction as source of truth.
 *
 * While internal pollTransaction has a polling step, schedules a timer (refresh or DEFAULT_TIMEOUT)
 * to call authClient.idx.proceed.
 *
 * Each network response:
 * If still a polling step, replaces pollTransaction (exposed for components like LoopbackProbe).
 * If no polling step (stable / terminal / success), sets stableTransaction (for main UI).
 *
 * Automatically aborts previous timer whenever a new external transaction starts polling or completes.
 *
 * @returns A tuple of [pollingTransaction, stableTransaction]
 * - pollingTransaction: Current polling state, updates on every poll response. Used by components
 *   that need to react to intermediate changes (e.g., LoopbackProbe watching challengeRequest).
 * - stableTransaction: Only set when polling completes. Used for main UI rendering to prevent
 *   unnecessary re-renders during active polling.
 */
export const usePolling = (
  idxTransaction: IdxTransaction | undefined,
  widgetProps: Partial<WidgetOptions>,
  data: Record<string, unknown>,
): readonly [
  pollingTransaction: IdxTransaction | undefined,
  stableTransaction: IdxTransaction | undefined,
] => {
  const { stateToken, authClient } = widgetProps;
  // Internal chain while polling
  const [pollTransaction, setPollTransaction] = useState<IdxTransaction | undefined>();
  // Exposed stable transaction (UI should render this)
  const [stableTransaction, setStableTransaction] = useState<IdxTransaction | undefined>();
  const timerRef = useRef<NodeJS.Timeout>();

  // Only respect inner polling state
  const pollingStep = useMemo(() => getPollingStep(pollTransaction), [pollTransaction]);

  // Seed / restart polling when external transaction starts a polling step.
  // If external is already stable (no poll step), expose it immediately.
  useEffect(() => {
    if (!idxTransaction) {
      return;
    }
    const outerPolling = getPollingStep(idxTransaction);
    if (outerPolling) {
      // Restart polling with fresh outer transaction; clear previous stableTransaction
      clearTimeout(timerRef.current);
      setPollTransaction(idxTransaction);
      setStableTransaction(undefined); // Clear stable transaction when starting new polling
    } else {
      // External is stable: stop any polling and return undefined
      clearTimeout(timerRef.current);
      setPollTransaction(undefined);
      setStableTransaction(undefined);
    }
  }, [idxTransaction]);

  // start polling timer when internal polling transaction changes
  useEffect(() => {
    if (!pollingStep || !pollTransaction) {
      return;
    }

    const { name, refresh = DEFAULT_TIMEOUT } = pollingStep;

    // one time request
    // the following polling requests will be triggered based on idxTransaction update
    timerRef.current = setTimeout(async () => {
      let payload: IdxActionParams = {};
      const autoChallenge = getAutoChallengeValue(pollTransaction, data);
      if (autoChallenge !== undefined) {
        payload.autoChallenge = autoChallenge;
      }

      // POLL_STEPS are not an action, so must treat as such
      if (isPollingStep(name)) {
        payload.step = name;
      } else {
        payload = { actions: [{ name, params: payload }] };
      }

      // TODO: Revert to use action once this fix is completed OKTA-512706
      const newTransaction = await authClient?.idx.proceed({
        stateHandle: stateToken && pollTransaction?.context?.stateHandle,
        ...payload,
      });

      // error code E0000047 is from a standard API error (unhandled)
      // TERMINAL_KEY.TOO_MANY_REQUESTS is error key from IDX API error message
      // check that there is no errorIntent to make sure it is not a standard IDX message error
      // @ts-expect-error OKTA-585869 errorCode & errorIntent properties missing from context type
      if ((newTransaction?.context?.errorCode === 'E0000047' && !newTransaction?.context?.errorIntent)
        || containsMessageKey(TERMINAL_KEY.TOO_MANY_REQUESTS, newTransaction?.messages)) {
        // When polling encounter rate limit error, wait 60 sec for rate limit bucket to reset before polling again
        const clonedTransaction = cloneDeep(pollTransaction);
        const clonedPollingStep = getPollingStep(clonedTransaction);
        if (clonedPollingStep !== undefined) {
          clonedPollingStep.refresh = 60000;
        }
        setPollTransaction(clonedTransaction);
        return;
      }

      // Continue or finish
      if (getPollingStep(newTransaction)) {
        setPollTransaction(newTransaction);
      } else {
        // Reached stable state
        setPollTransaction(undefined);
        setStableTransaction(newTransaction);
      }
    }, refresh);

    // eslint-disable-next-line consistent-return
    return () => {
      clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingStep]);

  // Only expose stable transaction (UI will not re-render intermediate poll states)
  return [pollTransaction, stableTransaction];
};
