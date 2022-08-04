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

import { IDX_STEP, OV_UV_ENABLE_BIOMETRIC_SERVER_KEY } from '../../constants';
import {
  FormBag,
  InfoboxElement,
  TransformStepFnWithOptions,
} from '../../types';
import { containsMessageKey, containsOneOfMessageKeys, loc } from '../../util';
import { transactionMessageTransformer } from '../i18n/transform';

export const OV_OVERRIDE_MESSAGE_KEY: Record<string, string> = {
  OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_IOS: 'oie.authenticator.app.non_fips_compliant_enrollment_device_incompatible',
  OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_NON_IOS: 'oie.authenticator.app.non_fips_compliant_enrollment_app_update_required',
  OV_QR_ENROLL_ENABLE_BIOMETRICS_KEY: 'oie.authenticator.app.method.push.enroll.enable.biometrics',
};

const fipsComplianceKeys = [
  OV_OVERRIDE_MESSAGE_KEY.OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_IOS,
  OV_OVERRIDE_MESSAGE_KEY.OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_NON_IOS,
];

export const CUSTOM_MESSAGE_KEYS = [
  OV_OVERRIDE_MESSAGE_KEY.OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_IOS,
  OV_OVERRIDE_MESSAGE_KEY.OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_NON_IOS,
  OV_OVERRIDE_MESSAGE_KEY.OV_QR_ENROLL_ENABLE_BIOMETRICS_KEY,
  OV_UV_ENABLE_BIOMETRIC_SERVER_KEY,
];

const EXCLUDE_MESSAGE_STEPS = [IDX_STEP.REENROLL_AUTHENTICATOR_WARNING];

interface IdxMessageWithTitle extends IdxMessage {
  title?: string;
}

const overrideMessagesWithTitle = (msgs: IdxMessage[]): IdxMessageWithTitle[] => {
  // only transform the first message (only contains one in this scenario)
  const [message]: IdxMessageWithTitle[] = msgs;
  if (containsOneOfMessageKeys(fipsComplianceKeys, msgs)) {
    message.title = 'oie.okta_verify.enroll.force.upgrade.title';
  } else if (containsMessageKey(OV_OVERRIDE_MESSAGE_KEY.OV_QR_ENROLL_ENABLE_BIOMETRICS_KEY, msgs)) {
    message.title = 'oie.authenticator.app.method.push.enroll.enable.biometrics.title';
  }
  return msgs;
};

const transformCustomMessages = (formBag: FormBag, messages: IdxMessage[]): FormBag => {
  const { uischema } = formBag;
  const formattedMessages = overrideMessagesWithTitle(messages);

  formattedMessages.forEach((message) => uischema.elements.unshift({
    type: 'InfoBox',
    options: {
      contentType: 'string',
      class: message.class ?? 'INFO',
      message: message.message,
      title: message.title && loc(message.title, 'login'),
    },
  } as InfoboxElement));

  return formBag;
};

export const transformMessages: TransformStepFnWithOptions = ({ transaction }) => (formBag) => {
  const { messages = [] } = transaction;
  const { uischema } = formBag;

  transactionMessageTransformer(transaction);

  if (containsOneOfMessageKeys(CUSTOM_MESSAGE_KEYS, messages)) {
    return transformCustomMessages(formBag, messages);
  }

  const shouldExcludeMessages = transaction?.nextStep?.name
    && EXCLUDE_MESSAGE_STEPS.includes(transaction.nextStep.name);

  if (shouldExcludeMessages) {
    return formBag;
  }

  messages.forEach((message) => uischema.elements.unshift({
    type: 'InfoBox',
    options: {
      contentType: 'string',
      class: message.class ?? 'INFO',
      message: message.message,
      dataSe: `infobox-${(message.class ?? 'INFO').toLowerCase()}`,
    },
  } as InfoboxElement));

  return formBag;
};
