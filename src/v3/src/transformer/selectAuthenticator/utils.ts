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

import { Input } from '@okta/okta-auth-js';
import { IdxOption } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';

import {
  AUTHENTICATOR_ALLOWED_FOR_OPTIONS,
  AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP,
  AUTHENTICATOR_KEY,
} from '../../constants';
import { ActionParams, AuthenticatorButtonElement, ButtonType } from '../../types';
import { loc } from '../../util';

export const getOptionValue = (
  inputs: Input[],
  key: string,
): Input | undefined => inputs?.find(
  ({ name }) => name === key,
);

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

const buildOktaVerifyOptions = (
  options: IdxOption[],
  step: string,
  isEnroll?: boolean,
): AuthenticatorButtonElement[] => {
  const ovRemediation = options.find((option) => option.relatesTo?.key === AUTHENTICATOR_KEY.OV);
  const id = (ovRemediation?.value as Input[])?.find(({ name }) => name === 'id')?.value;
  const methodType = (ovRemediation?.value as Input[])?.find(({ name }) => name === 'methodType');
  if (!methodType?.options?.length) {
    return [];
  }

  return methodType.options.map((option: IdxOption, index: number) => {
    const authenticatorButton: AuthenticatorButtonElement = {
      type: 'AuthenticatorButton',
      label: option.label,
      id: `auth_btn_${AUTHENTICATOR_KEY.OV}_${option.value || id}`,
      options: {
        type: ButtonType.BUTTON,
        key: AUTHENTICATOR_KEY.OV,
        ctaLabel: isEnroll
          ? loc('oie.enroll.authenticator.button.text', 'login')
          : loc('oie.verify.authenticator.button.text', 'login'),
        description: isEnroll
          ? loc(AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP[AUTHENTICATOR_KEY.OV], 'login')
          : loc('oie.okta_verify.label', 'login'),
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
    case AUTHENTICATOR_KEY.CUSTOM_APP:
      return option.relatesTo?.displayName as string || undefined;
    case AUTHENTICATOR_KEY.OV:
      return loc('oie.okta_verify.label', 'login');
    default:
      return undefined;
  }
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
      const authenticatorKey = option.relatesTo?.key as string;
      const id = getOptionValue(option.value as Input[], 'id')?.value;
      const methodType = getOptionValue(option.value as Input[], 'methodType')?.value;
      const enrollmentId = getOptionValue(option.value as Input[], 'enrollmentId')?.value;
      const AUTHENTICATORS_WITH_METHOD_TYPE = [
        AUTHENTICATOR_KEY.ON_PREM,
        AUTHENTICATOR_KEY.OV,
        AUTHENTICATOR_KEY.RSA,
      ];
      const AUTHENTICATORS_WITH_NO_TRANSLATE_CLASS = [
        AUTHENTICATOR_KEY.PHONE,
        AUTHENTICATOR_KEY.CUSTOM_APP,
      ];
      const AUTHENTICATORS_WITH_LTR_DESCRIPTION = [
        AUTHENTICATOR_KEY.PHONE,
      ];
      const authenticator = option.relatesTo;

      return {
        type: 'AuthenticatorButton',
        label: option.label,
        id: `auth_btn_${authenticatorKey}_${enrollmentId || id}`,
        noTranslate: !isEnroll && AUTHENTICATORS_WITH_NO_TRANSLATE_CLASS.includes(authenticatorKey),
        dir: !isEnroll && AUTHENTICATORS_WITH_LTR_DESCRIPTION.includes(authenticatorKey) ? 'ltr' : undefined,
        options: {
          type: ButtonType.BUTTON,
          key: authenticatorKey,
          authenticator,
          ctaLabel: isEnroll
            ? loc('oie.enroll.authenticator.button.text', 'login')
            : loc('oie.verify.authenticator.button.text', 'login'),
          description: getAuthenticatorDescription(
            option,
            authenticatorKey,
            isEnroll,
          ),
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
): AuthenticatorButtonElement[] => {
  const formattedOptions = formatAuthenticatorOptions(options, step, isEnroll);

  // appending OV options back to its original spot
  const ovOptions = buildOktaVerifyOptions(options, step, isEnroll);
  if (ovOptions.length && options?.length) {
    const ovIndex = options.findIndex(({ relatesTo }) => relatesTo?.key === AUTHENTICATOR_KEY.OV);
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
    label: option.label,
    id: `auth_btn_${authKey}_${option.value as string}`,
    noTranslate: authKey === AUTHENTICATOR_KEY.CUSTOM_APP,
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
): AuthenticatorButtonElement[] => getAuthenticatorButtonElements(
  authenticatorOptions,
  step,
  true,
);
