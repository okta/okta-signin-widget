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

import { IDX_STEP } from '../constants';

const POLL_STEPS = new Set<string>([
  IDX_STEP.CHALLENGE_POLL,
  IDX_STEP.DEVICE_CHALLENGE_POLL,
  IDX_STEP.ENROLL_POLL,
  IDX_STEP.POLL,
]);

export const isPollingStep = (stepName: string): boolean => POLL_STEPS.has(stepName);
