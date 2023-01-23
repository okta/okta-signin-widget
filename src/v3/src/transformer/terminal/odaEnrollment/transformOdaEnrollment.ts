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

import { CHALLENGE_METHOD } from '../../../constants';
import { IdxStepTransformer } from '../../../types';
import { transformOdaEnrollmentAndroidAppLink } from './transformOdaEnrollmentAndroidAppLink';
import { transformOdaEnrollmentLoopback } from './transformOdaEnrollmentLoopback';

export const transformOdaEnrollment: IdxStepTransformer = ({
  formBag,
  transaction,
  widgetProps,
}) => {
  // @ts-expect-error Property 'deviceEnrollment' does not exist on type 'IdxContext' ts(2339)
  const deviceEnrollment = transaction.context?.deviceEnrollment?.value;

  const isAndroidAppLink = deviceEnrollment.challengeMethod === CHALLENGE_METHOD.APP_LINK;

  if (isAndroidAppLink) {
    return transformOdaEnrollmentAndroidAppLink({ formBag, transaction, widgetProps });
  }
  return transformOdaEnrollmentLoopback({ formBag, transaction, widgetProps });
};
