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
  CellProps,
  UISchemaElement,
} from '@jsonforms/core';
import { FunctionComponent } from 'preact';
import { PollingElement } from 'src/types';

import { useInterval } from '../../../hooks';

const PollingControl: FunctionComponent<CellProps> = (
  { uischema, config, visible },
) => {
  const uiSchema = (uischema as UISchemaElement) as PollingElement;
  const { options: { refresh, idxMethod, skipValidation } } = uiSchema;

  useInterval(async () => {
    if (visible && !config?.isPendingRequest) {
      config?.proceed({ idxMethod, params: { refresh }, skipValidation });
    }
  }, refresh);

  return null;
};

export default PollingControl;
