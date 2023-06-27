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

import {
  useCallback, useEffect, useMemo, useState,
} from 'preact/hooks';

import { WidgetProps } from '../types';
import { isOauth2Enabled, SessionStorage } from '../util';

export const useStateHandle = (widgetProps: WidgetProps) => {
  const { overrideExistingStateToken, stateToken } = widgetProps;

  const initStateHandle = () => {
    // If url changes then widget assumes that user's intention was to initiate a new login flow,
    // so clear stored token to use the latest token.
    if (SessionStorage.getLastInitiatedLoginUrl() !== window.location.href) {
      SessionStorage.removeStateHandle();
    }
    if (overrideExistingStateToken) {
      SessionStorage.removeStateHandle();
    }
    return SessionStorage.getStateHandle();
  };

  const [sessionStateHandle, setSessionStateHandle] = useState<string | null>(initStateHandle);

  const unsetStateHandle = useCallback(() => {
    SessionStorage.removeStateHandle();
    setSessionStateHandle(null);
  }, [setSessionStateHandle]);

  useEffect(() => {
    if (overrideExistingStateToken) {
      unsetStateHandle();
    }
  }, [overrideExistingStateToken, unsetStateHandle]);

  const currentStateHandle = useMemo(() => (
    isOauth2Enabled(widgetProps) ? undefined : sessionStateHandle || stateToken
  ), [sessionStateHandle, stateToken, widgetProps]);

  return {
    unsetStateHandle,
    stateHandle: currentStateHandle,
  };
};
