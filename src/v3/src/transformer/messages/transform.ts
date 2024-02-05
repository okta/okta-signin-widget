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

import flow from 'lodash/flow';

import {
  CUSTOM_APP_UV_ENABLE_BIOMETRIC_SERVER_KEY,
  IDX_STEP,
  OV_NMC_FORCE_UPGRADE_SERVER_KEY,
  OV_UV_ENABLE_BIOMETRIC_SERVER_KEY,
  OV_UV_RESEND_ENABLE_BIOMETRIC_SERVER_KEY,
} from '../../constants';
import {
  InfoboxElement,
  TransformStepFnWithOptions,
  UISchemaElement,
  WidgetMessage,
} from '../../types';
import {
  containsMessageKey,
  containsOneOfMessageKeys,
  getBiometricsErrorMessageElement,
  getDisplayName,
  loc,
} from '../../util';
import { transactionMessageTransformer } from '../i18n';

export const OV_OVERRIDE_MESSAGE_KEY: Record<string, string> = {
  OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_IOS: 'oie.authenticator.app.non_fips_compliant_enrollment_device_incompatible',
  OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_NON_IOS: 'oie.authenticator.app.non_fips_compliant_enrollment_app_update_required',
  OV_QR_ENROLL_ENABLE_BIOMETRICS_KEY: 'oie.authenticator.app.method.push.enroll.enable.biometrics',
};

const fipsComplianceKeys = [
  OV_OVERRIDE_MESSAGE_KEY.OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_IOS,
  OV_OVERRIDE_MESSAGE_KEY.OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_NON_IOS,
];

const MESSAGE_KEYS_WITH_TITLE = [
  ...fipsComplianceKeys,
  OV_OVERRIDE_MESSAGE_KEY.OV_QR_ENROLL_ENABLE_BIOMETRICS_KEY,
  OV_NMC_FORCE_UPGRADE_SERVER_KEY,
];

export const CUSTOM_MESSAGE_KEYS = [
  ...fipsComplianceKeys,
  OV_OVERRIDE_MESSAGE_KEY.OV_QR_ENROLL_ENABLE_BIOMETRICS_KEY,
  OV_UV_ENABLE_BIOMETRIC_SERVER_KEY,
  OV_UV_RESEND_ENABLE_BIOMETRIC_SERVER_KEY,
  OV_NMC_FORCE_UPGRADE_SERVER_KEY,
  CUSTOM_APP_UV_ENABLE_BIOMETRIC_SERVER_KEY,
];

const EXCLUDE_MESSAGE_STEPS = [
  IDX_STEP.REENROLL_AUTHENTICATOR_WARNING,
  IDX_STEP.REQUEST_ACTIVATION,
  IDX_STEP.REENROLL_CUSTOM_PASSWORD_EXPIRY_WARNING,
];

const BIOMETRIC_SERVER_KEYS = [
  OV_UV_ENABLE_BIOMETRIC_SERVER_KEY,
  OV_UV_RESEND_ENABLE_BIOMETRIC_SERVER_KEY,
  CUSTOM_APP_UV_ENABLE_BIOMETRIC_SERVER_KEY,
];

const localizeTransactionMessages: TransformStepFnWithOptions = ({
  transaction,
}) => (formbag) => {
  if (!transaction.messages || transaction.messages.length < 1) {
    return formbag;
  }

  transactionMessageTransformer(transaction);

  return formbag;
};

const transformMessagesWithTitle: TransformStepFnWithOptions = ({
  transaction,
}) => (formbag) => {
  if (
    !transaction.messages
    || transaction.messages.length < 1
    || !containsOneOfMessageKeys(MESSAGE_KEYS_WITH_TITLE, transaction.messages)) {
    return formbag;
  }
  const { messages = [] } = transaction;
  const { uischema } = formbag;

  const messagesWithTitle: WidgetMessage[] = messages
    .filter((message) => MESSAGE_KEYS_WITH_TITLE.includes(message.i18n?.key));
  // only transform the first message (only contains one in this scenario)
  const [widgetMessage]: WidgetMessage[] = messagesWithTitle;
  if (containsOneOfMessageKeys(fipsComplianceKeys, messagesWithTitle)) {
    widgetMessage.title = loc('oie.okta_verify.enroll.force.upgrade.title', 'login');
  } else if (containsMessageKey(
    OV_OVERRIDE_MESSAGE_KEY.OV_QR_ENROLL_ENABLE_BIOMETRICS_KEY,
    messagesWithTitle,
  )) {
    widgetMessage.title = loc('oie.authenticator.app.method.push.enroll.enable.biometrics.title', 'login');
  } else if (containsMessageKey(OV_NMC_FORCE_UPGRADE_SERVER_KEY, messagesWithTitle)) {
    widgetMessage.title = loc('oie.numberchallenge.force.upgrade.title', 'login');
  }

  const messageElements: UISchemaElement[] = [];
  messagesWithTitle.forEach((message) => messageElements.push({
    type: 'InfoBox',
    options: {
      class: message.class ?? 'INFO',
      message,
      dataSe: 'callout',
    },
  } as InfoboxElement));

  uischema.elements = messageElements.concat(uischema.elements);

  return formbag;
};

const transformBiometricsErrorMessage: TransformStepFnWithOptions = ({
  transaction,
}) => (formbag) => {
  if (
    !transaction.messages
    || transaction.messages.length === 0
    || !containsOneOfMessageKeys(BIOMETRIC_SERVER_KEYS, transaction.messages)
  ) {
    return formbag;
  }
  const { messages = [] } = transaction;
  const { uischema } = formbag;
  const biometricsErrorMessages: WidgetMessage[] = messages
    .filter((message) => BIOMETRIC_SERVER_KEYS.includes(message.i18n?.key));

  const messageElements: UISchemaElement[] = [];
  biometricsErrorMessages.forEach((message) => messageElements.push({
    type: 'InfoBox',
    options: {
      class: message.class ?? 'INFO',
      message: getBiometricsErrorMessageElement(message.i18n?.key, getDisplayName(transaction)),
      dataSe: 'callout',
    },
  } as InfoboxElement));

  uischema.elements = messageElements.concat(uischema.elements);

  return formbag;
};

const transformGeneralMessages: TransformStepFnWithOptions = ({
  transaction,
}) => (formbag) => {
  const { messages = [] } = transaction;
  const { uischema } = formbag;

  const containsCustomMessages = containsOneOfMessageKeys(CUSTOM_MESSAGE_KEYS, messages);
  const shouldExcludeMessagesForStep = transaction?.nextStep?.name
    && EXCLUDE_MESSAGE_STEPS.includes(transaction.nextStep.name);
  if (shouldExcludeMessagesForStep || containsCustomMessages) {
    return formbag;
  }

  const messageElements: UISchemaElement[] = [];
  messages.forEach((message) => {
    const messageClass = message.class ?? 'INFO';
    messageElements.push({
      type: 'InfoBox',
      options: {
        class: messageClass,
        message,
        dataSe: 'callout',
      },
    } as InfoboxElement);
  });

  uischema.elements = messageElements.concat(uischema.elements);

  return formbag;
};

export const transformMessages: TransformStepFnWithOptions = (options) => (formbag) => flow(
  localizeTransactionMessages(options),
  transformMessagesWithTitle(options),
  transformBiometricsErrorMessage(options),
  transformGeneralMessages(options),
)(formbag);
