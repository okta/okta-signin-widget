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

import { CUSTOM_MESSAGE_KEYS, OV_OVERRIDE_MESSAGE_KEY } from '../../constants';
import {
  IdxStepTransformer, InfoboxElement, MessageType, MessageTypeVariant,
} from '../../types';
import { containsMessageKey, containsOneOfMessageKeys } from '../../util';

const fipsComplianceKeys = [
  OV_OVERRIDE_MESSAGE_KEY.OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_IOS,
  OV_OVERRIDE_MESSAGE_KEY.OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_NON_IOS,
];

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

export const transformCustomMessages: IdxStepTransformer = (transaction, formBag) => {
  const { messages } = transaction;
  const { uischema } = formBag;

  if (!messages?.length || !containsOneOfMessageKeys(CUSTOM_MESSAGE_KEYS, messages)) {
    return formBag;
  }

  const formattedMessages = overrideMessagesWithTitle(messages);

  formattedMessages.forEach((message) => uischema.elements.unshift({
    type: 'InfoBox',
    options: {
      contentType: 'string',
      class: MessageTypeVariant[message.class as MessageType] ?? MessageTypeVariant.INFO,
      message: message.message,
      title: message.title,
    },
  } as InfoboxElement));

  return formBag;
};
