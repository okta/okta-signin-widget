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

import { WithContextTransformStepFn } from '../main';
import TransformerMap from './idxTransformerMapping';
import { mapLayout } from './mapLayout';

export const transformLayout: WithContextTransformStepFn = (transaction) => (formbag) => {
  const { context, nextStep } = transaction;

  if (!nextStep) {
    return formbag;
  }

  // Look up layout transform fn from "TransformerMap"
  // 1) by stepName first
  // 2) by {stepName}.{authenticatorKey} if cannot find fn by stepName
  const stepName = nextStep?.name;
  let transformFn = TransformerMap[stepName];
  if (!transformFn) {
    const authenticatorKey = context.currentAuthenticator?.value?.key
      || nextStep?.relatesTo?.value?.key;
    transformFn = TransformerMap[`${stepName}.${authenticatorKey}`];
  }

  if (typeof transformFn !== 'function') {
    throw new Error(`Missing custom layout transform for ${stepName}`);
  }

  // update uischema to custom transformed layout
  // eslint-disable-next-line no-param-reassign
  formbag.uischema = mapLayout(transformFn(), formbag.uischema.elements);

  return formbag;
};
