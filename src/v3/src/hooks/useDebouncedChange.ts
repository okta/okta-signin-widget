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

import { debounce } from 'lodash';
import { ChangeEventHandler } from 'preact/compat';
import { useState, useCallback, useEffect } from 'preact/hooks';

const eventToValue = (ev: any) => ev.target.value;
export const useDebouncedChange = (
  handleChange: (path: string, value: any) => void,
  defaultValue: any,
  data: any,
  path: string,
  eventToValueFunction: (ev: any) => any = eventToValue,
  timeout = 50
): [any, ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>, () => void] => {
  const [input, setInput] = useState(data ?? defaultValue);
  useEffect(() => {
    setInput(data ?? defaultValue);
  }, [data]);
  const debouncedUpdate = useCallback(
    debounce((newValue: string) => handleChange(path, newValue), timeout),
    [handleChange, path, timeout]
  );
  const onChange = useCallback(
    (ev: any) => {
      const newValue = eventToValueFunction(ev);
      setInput(newValue ?? defaultValue);
      debouncedUpdate(newValue);
    },
    [debouncedUpdate, eventToValueFunction]
  );
  const onClear = useCallback(() => {
    setInput(defaultValue);
    handleChange(path, undefined);
  }, [defaultValue, handleChange, path]);
  return [input, onChange, onClear];
};