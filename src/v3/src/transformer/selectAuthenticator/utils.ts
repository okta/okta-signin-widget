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

import { IdxAuthenticator, Input } from '@okta/okta-auth-js';
import { IdxOption } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';

import {
  AUTHENTICATOR_ALLOWED_FOR_OPTIONS,
  AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP,
  AUTHENTICATOR_KEY,
} from '../../constants';
import { ActionParams, AuthenticatorButtonElement, ButtonType } from '../../types';
import { loc } from '../../util';

const getVerifyEmailAriaLabel = (email?: string): string => (email
  ? loc('oie.select.authenticator.verify.email.with.email.label', 'login', [email])
  : loc('oie.select.authenticator.verify.email.label', 'login')
);

const getVerifyPhoneAriaLabel = (phone?: string): string => (phone
  ? loc('oie.select.authenticator.verify.phone.with.phone.label', 'login', [phone])
  : loc('oie.select.authenticator.verify.phone.label', 'login')
);

const getOktaVerifyAriaLabel = (
  isEnroll?: boolean,
  methodType?: IdxOption['value'],
): string => {
  if (isEnroll) {
    return loc('oie.select.authenticator.enroll.okta_verify.authenticator.label', 'login');
  }
  const defaultLabel = loc('oie.select.authenticator.verify.okta_verify.label', 'login');
  if (typeof methodType === 'undefined') {
    return defaultLabel;
  }
  const methodTypeLabelMap: Record<string, string> = {
    push: loc('oie.select.authenticator.okta_verify.push.label', 'login'),
    totp: loc('oie.select.authenticator.okta_verify.totp.label', 'login'),
    signed_nonce: loc('oie.select.authenticator.okta_verify.signed_nonce.label', 'login'),
  };
  return methodTypeLabelMap[methodType as string] || defaultLabel;
};

const getAuthenticatorAriaLabel = (
  option: IdxOption,
  authenticatorKey: string,
  methodType?: IdxOption['value'],
  isEnroll?: boolean,
): string => {
  switch (authenticatorKey) {
    case AUTHENTICATOR_KEY.EMAIL:
      return isEnroll
        ? loc('oie.select.authenticator.enroll.email.label', 'login')
        : getVerifyEmailAriaLabel(option.relatesTo?.profile?.email as string || undefined);
    case AUTHENTICATOR_KEY.PHONE:
      return isEnroll
        ? loc('oie.select.authenticator.enroll.phone.label', 'login')
        : getVerifyPhoneAriaLabel(option.relatesTo?.profile?.phoneNumber as string || undefined);
    case AUTHENTICATOR_KEY.PASSWORD:
      return isEnroll
        ? loc('oie.select.authenticator.enroll.password.label', 'login')
        : loc('oie.select.authenticator.verify.password.label', 'login');
    case AUTHENTICATOR_KEY.SECURITY_QUESTION:
      return isEnroll
        ? loc('oie.select.authenticator.enroll.security.question.label', 'login')
        : loc('oie.select.authenticator.verify.security.question.label', 'login');
    case AUTHENTICATOR_KEY.WEBAUTHN:
      return isEnroll
        ? loc('oie.select.authenticator.enroll.webauthn.label', 'login')
        : loc('oie.select.authenticator.verify.webauthn.label', 'login');
    case AUTHENTICATOR_KEY.OV:
      return getOktaVerifyAriaLabel(isEnroll, methodType);
    default:
      return isEnroll
        ? loc('oie.select.authenticator.enroll.named.authenticator.label', 'login', [option.label])
        : loc('oie.select.authenticator.verify.named.authenticator.label', 'login', [option.label]);
  }
};

export const getOptionValue = (
  inputs: Input[],
  key: string,
): Input | undefined => inputs?.find(
  ({ name }) => name === key,
);

const isAuthenticatorAlreadyEnrolled = (
  authenticator: IdxAuthenticator,
  authenticatorEnrollments?: IdxAuthenticator[],
) => !!authenticatorEnrollments?.some(({ key }) => key === authenticator.key);

const getAuthenticatorDataSeVal = (authenticatorKey: string, methodType?: string): string => {
  if (authenticatorKey) {
    const method = methodType ? `-${methodType}` : '';
    return `${authenticatorKey}${method}`;
  }
  return '';
};

const reorderAuthenticatorButtons = (
  authButtons: AuthenticatorButtonElement[],
  deviceKnown?: boolean,
): AuthenticatorButtonElement[] => {
  if (authButtons.length <= 1) {
    return authButtons;
  }
  const fastpassAuthenticator = authButtons.find(
    (button) => button.options.actionParams?.['authenticator.methodType'] === 'signed_nonce',
  );
  if (!fastpassAuthenticator) {
    return authButtons;
  }

  const updatedAuthenticatorBtns = authButtons.filter(
    (button) => button.options.actionParams?.['authenticator.methodType'] !== 'signed_nonce',
  );

  // Re-arrange fastpass in options based on deviceKnown
  // If deviceKnown is set, set fastpass as the first option in the list
  // otherwise, place it as the last item in the list of OV options
  if (deviceKnown) {
    updatedAuthenticatorBtns.unshift(fastpassAuthenticator);
  } else {
    updatedAuthenticatorBtns.push(fastpassAuthenticator);
  }

  return updatedAuthenticatorBtns;
};

const getAuthenticatorLabel = (
  option: IdxOption,
  authenticatorKey: string,
): string => {
  switch (authenticatorKey) {
    case AUTHENTICATOR_KEY.CUSTOM_APP:
      return option.relatesTo?.displayName ?? option.label;
    case AUTHENTICATOR_KEY.OV:
      return loc('oie.okta_verify.label', 'login');
    default:
      return option.label;
  }
};

const getAuthenticatorDescriptionParams = (
  option: IdxOption,
  authenticatorKey: string,
  isEnroll?: boolean,
): string[] | undefined => {
  const authenticatorDescrWithParams = [
    AUTHENTICATOR_KEY.ON_PREM,
    AUTHENTICATOR_KEY.IDP,
    AUTHENTICATOR_KEY.CUSTOM_APP,
    AUTHENTICATOR_KEY.SYMANTEC_VIP,
  ];
  if (!isEnroll || !authenticatorDescrWithParams.includes(authenticatorKey)) {
    return undefined;
  }

  switch (authenticatorKey) {
    case AUTHENTICATOR_KEY.ON_PREM: {
      const vendorName = option.relatesTo?.displayName
        || loc('oie.on_prem.authenticator.default.vendorName', 'login');
      return [vendorName];
    }
    case AUTHENTICATOR_KEY.IDP: {
      const idpName = option.relatesTo?.displayName || '';
      return [idpName];
    }
    case AUTHENTICATOR_KEY.CUSTOM_APP: {
      const customAppName = option.label || '';
      return [customAppName];
    }
    case AUTHENTICATOR_KEY.SYMANTEC_VIP: {
      const appName = option.relatesTo?.displayName || '';
      return [appName];
    }
    default:
      return undefined;
  }
};

const getAuthenticatorDescription = (
  option: IdxOption,
  authenticatorKey: string,
  isEnroll?: boolean,
): string | undefined => {
  if (!authenticatorKey) {
    return undefined;
  }
  const descrParams = getAuthenticatorDescriptionParams(
    option,
    authenticatorKey,
    isEnroll,
  );
  if (isEnroll) {
    return loc(AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP[authenticatorKey], 'login', descrParams);
  }

  switch (authenticatorKey) {
    case AUTHENTICATOR_KEY.PHONE:
      return option.relatesTo?.profile?.phoneNumber as string || undefined;
    case AUTHENTICATOR_KEY.EMAIL:
      return option.relatesTo?.profile?.email as string || undefined;
    case AUTHENTICATOR_KEY.OV:
      return option.label;
    default:
      return undefined;
  }
};

const getCtaLabel = (
  isEnroll?: boolean,
  isAdditionalEnroll?: boolean,
) => {
  if (isAdditionalEnroll) {
    return loc('enroll.choices.setup.another', 'login');
  }
  if (isEnroll) {
    return loc('oie.enroll.authenticator.button.text', 'login');
  }
  return loc('oie.verify.authenticator.button.text', 'login');
};

const buildOktaVerifyOptions = (
  options: IdxOption[],
  step: string,
  isEnroll?: boolean,
  authenticatorEnrollments?: IdxAuthenticator[],
): AuthenticatorButtonElement[] => {
  const ovRemediation = options.find((option) => option.relatesTo?.key === AUTHENTICATOR_KEY.OV);
  const isAdditionalEnroll = isEnroll && ovRemediation?.relatesTo
    && isAuthenticatorAlreadyEnrolled(ovRemediation.relatesTo, authenticatorEnrollments);
  const id = (ovRemediation?.value as Input[])?.find(({ name }) => name === 'id')?.value;
  const methodType = (ovRemediation?.value as Input[])?.find(({ name }) => name === 'methodType');
  if (!methodType?.options?.length) {
    return [];
  }

  return methodType.options.map((option: IdxOption, index: number) => {
    const authenticatorButton: AuthenticatorButtonElement = {
      type: 'AuthenticatorButton',
      label: getAuthenticatorLabel(option, AUTHENTICATOR_KEY.OV),
      id: `auth_btn_${AUTHENTICATOR_KEY.OV}_${option.value || id}`,
      options: {
        type: ButtonType.BUTTON,
        key: AUTHENTICATOR_KEY.OV,
        isEnroll,
        isAdditionalEnroll,
        ctaLabel: getCtaLabel(isEnroll, isAdditionalEnroll),
        description: getAuthenticatorDescription(
          option,
          AUTHENTICATOR_KEY.OV,
          isEnroll,
        ),
        ariaLabel: getAuthenticatorAriaLabel(option, AUTHENTICATOR_KEY.OV, option.value, isEnroll),
        actionParams: {
          'authenticator.methodType': option.value,
          'authenticator.id': id,
        } as ActionParams,
        step,
        includeData: true,
        includeImmutableData: false,
        dataSe: getAuthenticatorDataSeVal(AUTHENTICATOR_KEY.OV, option.value as string),
        iconName: option.value === 'totp' ? `oktaVerify_${index}` : `oktaVerifyPush_${index}`,
        iconDescr: option.value === 'totp'
          ? loc('factor.totpSoft.description', 'login')
          : loc('factor.push.description', 'login'),
      },
    };
    return authenticatorButton;
  });
};

const getNickname = (
  option: IdxOption,
  authenticatorKey: string,
  isEnroll?: boolean,
): string | undefined => {
  if (!authenticatorKey || isEnroll) {
    return undefined;
  }

  if (authenticatorKey === AUTHENTICATOR_KEY.PHONE) {
    // @ts-expect-error OKTA-661650 nickname missing from IdxAuthenticator
    return option.relatesTo?.nickname;
  }
  return undefined;
};

const getUsageDescription = (option: IdxOption): string | undefined => {
  // @ts-ignore IdxAuthenticator missing allowedFor property
  const { allowedFor } = option.relatesTo;
  switch (allowedFor) {
    case AUTHENTICATOR_ALLOWED_FOR_OPTIONS.ANY:
      return loc('oie.enroll.authenticator.usage.text.access.recovery', 'login');
    case AUTHENTICATOR_ALLOWED_FOR_OPTIONS.RECOVERY:
      return loc('oie.enroll.authenticator.usage.text.recovery', 'login');
    case AUTHENTICATOR_ALLOWED_FOR_OPTIONS.SSO:
      return loc('oie.enroll.authenticator.usage.text.access', 'login');
    default:
      return undefined;
  }
};

const formatAuthenticatorOptions = (
  options: IdxOption[],
  step: string,
  isEnroll?: boolean,
  authenticatorEnrollments?: IdxAuthenticator[],
): AuthenticatorButtonElement[] => {
  const authenticatorOptionSet = new Set<string>();
  return options
    .filter((option: IdxOption) => {
      if (isEnroll) {
        return true;
      }
      // If webauthn enrollments > 1 just show one entry with a generic namne (first)
      // so user doesnt have to select which one to pick. eg)
      // If there is yubikey5 and another unknown u2f key, user cannot identify that easily.
      // We need to do this at least  until users can give authenticator enrollments custom names.
      let isDup = false;
      const authenticatorKey = option.relatesTo?.key as string;
      if (authenticatorKey === AUTHENTICATOR_KEY.WEBAUTHN) {
        isDup = authenticatorOptionSet.has(authenticatorKey);
        authenticatorOptionSet.add(authenticatorKey);
      } else if (authenticatorKey === AUTHENTICATOR_KEY.CUSTOM_APP) {
        const id = getOptionValue(option.value as Input[], 'id')?.value as string;
        isDup = authenticatorOptionSet.has(id);
        authenticatorOptionSet.add(id);
      }
      return !isDup;
    })
    .map((option: IdxOption, index: number) => {
      const authenticator = option.relatesTo;
      const authenticatorKey = authenticator?.key as string;
      const id = getOptionValue(option.value as Input[], 'id')?.value;
      const methodType = getOptionValue(option.value as Input[], 'methodType')?.value;
      const enrollmentId = getOptionValue(option.value as Input[], 'enrollmentId')?.value;
      const isAdditionalEnroll = isEnroll && authenticator
        && isAuthenticatorAlreadyEnrolled(authenticator, authenticatorEnrollments);
      const AUTHENTICATORS_WITH_METHOD_TYPE = [
        AUTHENTICATOR_KEY.ON_PREM,
        AUTHENTICATOR_KEY.OV,
        AUTHENTICATOR_KEY.RSA,
      ];
      const AUTHENTICATORS_WITH_NO_TRANSLATE_CLASS = [
        AUTHENTICATOR_KEY.PHONE,
        AUTHENTICATOR_KEY.EMAIL,
      ];
      const AUTHENTICATORS_WITH_LTR_DESCRIPTION = [
        AUTHENTICATOR_KEY.PHONE,
      ];

      return {
        type: 'AuthenticatorButton',
        label: getAuthenticatorLabel(option, authenticatorKey),
        id: `auth_btn_${authenticatorKey}_${enrollmentId || id}`,
        noTranslate: !isEnroll && AUTHENTICATORS_WITH_NO_TRANSLATE_CLASS.includes(authenticatorKey),
        dir: !isEnroll && AUTHENTICATORS_WITH_LTR_DESCRIPTION.includes(authenticatorKey) ? 'ltr' : undefined,
        options: {
          type: ButtonType.BUTTON,
          key: authenticatorKey,
          isEnroll,
          isAdditionalEnroll,
          authenticator,
          ctaLabel: getCtaLabel(isEnroll, isAdditionalEnroll),
          description: getAuthenticatorDescription(
            option,
            authenticatorKey,
            isEnroll,
          ),
          ariaLabel: getAuthenticatorAriaLabel(option, authenticatorKey, methodType, isEnroll),
          nickname: getNickname(option, authenticatorKey, isEnroll),
          usageDescription: isEnroll && getUsageDescription(option),
          // @ts-ignore logoUri missing from interface
          logoUri: authenticator.logoUri,
          actionParams: {
            'authenticator.id': id,
            'authenticator.methodType': AUTHENTICATORS_WITH_METHOD_TYPE.includes(authenticatorKey)
              ? methodType
              : undefined,
            'authenticator.enrollmentId': enrollmentId,
          },
          step,
          includeData: true,
          includeImmutableData: false,
          dataSe: getAuthenticatorDataSeVal(
            authenticatorKey,
            AUTHENTICATORS_WITH_METHOD_TYPE.includes(authenticatorKey) && typeof methodType === 'string'
              ? methodType
              : undefined,
          ),
          iconName: `${authenticatorKey}_${index}`,
        },
      } as AuthenticatorButtonElement;
    });
};

const getAuthenticatorButtonElements = (
  options: IdxOption[],
  step: string,
  isEnroll?: boolean,
  authenticatorEnrollments?: IdxAuthenticator[],
): AuthenticatorButtonElement[] => {
  const formattedOptions = formatAuthenticatorOptions(
    options, step, isEnroll, authenticatorEnrollments,
  );

  // appending OV options back to its original spot
  const ovOptions = buildOktaVerifyOptions(options, step, isEnroll, authenticatorEnrollments);
  if (ovOptions.length && options?.length) {
    const ovIndex = formattedOptions.findIndex((
      { options: { authenticator } },
    ) => authenticator?.key === AUTHENTICATOR_KEY.OV);
    formattedOptions.splice(ovIndex, 1, ...ovOptions);
  }

  const ovRemediation = options.find((option) => option.relatesTo?.key === AUTHENTICATOR_KEY.OV);
  const methodType = (ovRemediation?.value as Input[])?.find(({ name }) => name === 'methodType');
  // Only re-order auth buttons when options contains OV with signed_nonce method type
  if (!methodType?.options?.find((option: IdxOption) => option.value === 'signed_nonce')) {
    return formattedOptions;
  }
  const deviceKnown = ovRemediation?.relatesTo?.deviceKnown;
  return reorderAuthenticatorButtons(formattedOptions, deviceKnown);
};

export const getAppAuthenticatorMethodButtonElements = (
  authenticator: Input,
  step: string,
  authKey = AUTHENTICATOR_KEY.OV,
  deviceKnown?: boolean,
): AuthenticatorButtonElement[] => {
  const id = (authenticator.value as Input[])?.find(({ name }) => name === 'id')?.value as string;
  const methodType = (authenticator.value as Input[])?.find(({ name }) => name === 'methodType');
  if (!methodType?.options?.length) {
    return [];
  }

  const authButtons = methodType.options.map((option, index) => ({
    type: 'AuthenticatorButton',
    label: getAuthenticatorLabel(option, authKey),
    id: `auth_btn_${authKey}_${option.value as string}`,
    options: {
      type: ButtonType.BUTTON,
      key: authKey,
      ctaLabel: loc('oie.verify.authenticator.button.text', 'login'),
      actionParams: {
        'authenticator.id': id,
        'authenticator.methodType': (option.value as string),
      },
      description: getAuthenticatorDescription(
        option,
        authKey,
        false,
      ),
      ariaLabel: getAuthenticatorAriaLabel(option, authKey, (option.value as string)),
      dataSe: getAuthenticatorDataSeVal(
        authKey,
        option.value as string,
      ),
      iconName: `${authKey}_${index}`,
      step,
      includeData: true,
      includeImmutableData: false,
    },
  })) as AuthenticatorButtonElement[];

  return reorderAuthenticatorButtons(authButtons, deviceKnown);
};

export const isOnlyPushWithAutoChallenge = (
  inputs?: Input[],
): boolean => {
  const methodType = inputs?.find(({ name }) => name === 'methodType');
  const autoChallenge = inputs?.find(({ name }) => name === 'autoChallenge');

  return typeof autoChallenge !== 'undefined'
    && methodType?.options?.length === 1
    && methodType.options[0].value === 'push';
};

export const getAuthenticatorVerifyButtonElements = (
  authenticatorOptions: IdxOption[],
  step: string,
):AuthenticatorButtonElement[] => getAuthenticatorButtonElements(
  authenticatorOptions,
  step,
);

export const getAuthenticatorEnrollButtonElements = (
  authenticatorOptions: IdxOption[],
  step: string,
  authenticatorEnrollments?: IdxAuthenticator[],
): AuthenticatorButtonElement[] => getAuthenticatorButtonElements(
  authenticatorOptions,
  step,
  true,
  authenticatorEnrollments,
);
