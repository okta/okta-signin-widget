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

import { flow } from 'lodash';

import { TransformStepFn } from '../../types';
import { loc } from '../../util';

const customizeRequiredMinLengthMessages: TransformStepFn = (formbag) => {
  const { schema } = formbag;

  if (typeof schema.errorMessage === 'undefined') {
    schema.errorMessage = { type: 'object' };
  }

  schema.errorMessage.required = loc('model.validation.field.blank', 'login');
  schema.errorMessage.minLength = loc('model.validation.field.blank', 'login');

  return formbag;
};

export const transformErrorSchema: TransformStepFn = (formbag) => flow(
  customizeRequiredMinLengthMessages,
)(formbag);
