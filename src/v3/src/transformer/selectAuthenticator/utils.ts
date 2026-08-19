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
import TimeUtil from 'util/TimeUtil';

import {
  getWebAuthnI18nKey,
  getWebAuthnI18nParams,
  WEBAUTHN_DISPLAY_NAMES,
  WEBAUTHN_I18N_KEYS,
} from '../../../../util/webauthnDisplayNameUtils';
import {
  AUTHENTICATOR_ALLOWED_FOR_OPTIONS,
  AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP,
  AUTHENTICATOR_KEY,
} from '../../constants';
import {
  ActionParams,
  AuthenticatorButtonElement,
  AuthenticatorGroupCardElement,
  ButtonType,
} from '../../types';
import { loc } from '../../util';

// N-of-M wire types for authenticatorGroups[]. Not yet in the auth-js SDK, so
// declared inline; matches idx-authenticator-groups-siw-contract page 2.
export interface AuthenticatorGroupGracePeriod {
  type?: 'BY_DATE_TIME' | 'BY_SKIP_COUNT';
  expiry?: string;
  skipCount?: number;
  remainingSkips?: number;
}

export interface AuthenticatorGroup {
  groupId: string;
  // Currently always 'REQUIRED' per contract; the active gate is remaining > 0.
  status: 'REQUIRED';
  criteria: { type: string; count: number }[];
  remaining: number;
  gracePeriod?: AuthenticatorGroupGracePeriod;
}

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
    case AUTHENTICATOR_KEY.WEBAUTHN: {
      const displayName = option.relatesTo?.displayName;
      const keyMap = isEnroll
        ? WEBAUTHN_I18N_KEYS.SELECT_ENROLL_LABEL
        : WEBAUTHN_I18N_KEYS.SELECT_VERIFY_LABEL;
      const i18nKey = getWebAuthnI18nKey(keyMap, displayName);
      const params = getWebAuthnI18nParams(displayName);
      return loc(i18nKey, 'login', params);
    }
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
    case AUTHENTICATOR_KEY.WEBAUTHN: {
      const displayName = option.relatesTo?.displayName;
      // For Passkeys, return localized label; for custom, return displayName itself
      if (displayName === WEBAUTHN_DISPLAY_NAMES.PASSKEYS) {
        return loc('oie.webauthn.passkeysRebrand.passkeys.label', 'login');
      } if (displayName && displayName !== WEBAUTHN_DISPLAY_NAMES.DEFAULT) {
        return displayName; // Custom display name
      }
      return loc('oie.webauthn.label', 'login'); // DEFAULT case
    }
    case AUTHENTICATOR_KEY.OV:
      return loc('oie.okta_verify.label', 'login');
    default:
      return option.label;
  }
};

const getGracePeriodRequiredDescription = (remainingGracePeriodDays: number) => {
  if (remainingGracePeriodDays === 1) {
    return loc('oie.enrollment.policy.grace.period.required.in.one.day', 'login');
  } if (remainingGracePeriodDays > 1) {
    return loc(
      'oie.enrollment.policy.grace.period.required.in.days',
      'login',
      [remainingGracePeriodDays],
    );
  }
  return loc('oie.enrollment.policy.grace.period.required.today', 'login');
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

  // Handle WebAuthn enrollment descriptions based on displayName
  if (isEnroll && authenticatorKey === AUTHENTICATOR_KEY.WEBAUTHN) {
    const displayName = option.relatesTo?.displayName;
    const customDescription = option.relatesTo?.description;

    // For custom with description, use that
    if (customDescription
        && displayName !== WEBAUTHN_DISPLAY_NAMES.DEFAULT
        && displayName !== WEBAUTHN_DISPLAY_NAMES.PASSKEYS) {
      return customDescription;
    }

    // For Passkeys, use specific description
    if (displayName === WEBAUTHN_DISPLAY_NAMES.PASSKEYS) {
      return loc('oie.webauthn.passkeysRebrand.passkeys.description', 'login');
    }

    // Default description
    return loc('oie.webauthn.description', 'login');
  }

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
    case AUTHENTICATOR_KEY.NFC_PIN:
      return loc('oie.nfc_pin.verify.description', 'login');
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
  languageTags?: string[],
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

      // @ts-ignore TODO: Add grace period fields to auth-js SDK https://oktainc.atlassian.net/browse/OKTA-848910
      const dateMs = new Date(authenticator?.gracePeriod?.expiry).getTime();
      // using isNaN as ie11 does not support Number.isNaN
      // eslint-disable-next-line no-restricted-globals
      const gracePeriodEpochTimestampMs = isNaN(dateMs) ? 0 : dateMs;
      const currentTimestampMs = Date.now();

      let remainingGracePeriodDays = 0;
      let hasGracePeriods = false;
      // @ts-ignore TODO: Add grace period fields to auth-js SDK https://oktainc.atlassian.net/browse/OKTA-848910
      const gracePeriodRemainingSkips = authenticator?.gracePeriod?.remainingSkips;
      let gracePeriodRemainingSkipsDescription = null;
      if (currentTimestampMs < gracePeriodEpochTimestampMs) {
        remainingGracePeriodDays = TimeUtil.calculateDaysBetween(
          currentTimestampMs,
          gracePeriodEpochTimestampMs,
        );
        hasGracePeriods = true;
      } else if (gracePeriodRemainingSkips && gracePeriodRemainingSkips > 0) {
        hasGracePeriods = true;
        if (gracePeriodRemainingSkips === 1) {
          gracePeriodRemainingSkipsDescription = loc('oie.enrollment.policy.grace.period.required.in.one.skip', 'login');
        } else if (gracePeriodRemainingSkips > 1) {
          gracePeriodRemainingSkipsDescription = loc(
            'oie.enrollment.policy.grace.period.required.in.number.of.skips',
            'login',
            [gracePeriodRemainingSkips],
          );
        }
      }

      const gracePeriodExpiry = (hasGracePeriods
        && gracePeriodEpochTimestampMs && Array.isArray(languageTags)
        && TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(
          new Date(gracePeriodEpochTimestampMs),
          languageTags,
          false,
        )) || null;
      const gracePeriodRequiredDescription = (gracePeriodExpiry
        && getGracePeriodRequiredDescription(remainingGracePeriodDays)) || null;

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
          gracePeriodExpiry,
          gracePeriodRequiredDescription,
          gracePeriodRemainingSkipsDescription,
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
          // N-of-M: opaque group affiliation from the wire, threaded through so
          // the transformer can partition options into group cards. Never
          // rendered to end users. Only set when present so legacy responses
          // produce byte-identical option shapes.
          ...(
            // @ts-ignore TODO: Add groupIds field to IdxAuthenticator in auth-js SDK
            Array.isArray(authenticator?.groupIds) && authenticator.groupIds.length > 0
              // @ts-ignore TODO: Add groupIds field to IdxAuthenticator in auth-js SDK
              ? { groupIds: authenticator.groupIds }
              : {}
          ),
        },
      } as AuthenticatorButtonElement;
    });
};

const getAuthenticatorButtonElements = (
  options: IdxOption[],
  step: string,
  isEnroll?: boolean,
  languageTags?: string[],
  authenticatorEnrollments?: IdxAuthenticator[],
): AuthenticatorButtonElement[] => {
  const formattedOptions = formatAuthenticatorOptions(
    options, step, isEnroll, languageTags, authenticatorEnrollments,
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
  languageTags?: string[],
  authenticatorEnrollments?: IdxAuthenticator[],
): AuthenticatorButtonElement[] => getAuthenticatorButtonElements(
  authenticatorOptions,
  step,
  true,
  languageTags,
  authenticatorEnrollments,
);

// --- N-of-M helpers ---------------------------------------------------------

/**
 * Returns true iff an already-transformed AuthenticatorButtonElement carries a
 * post-processed active grace-period marker. formatAuthenticatorOptions only
 * sets gracePeriodRequiredDescription / gracePeriodRemainingSkipsDescription
 * when the wire-side grace period is active — testing those is safe.
 *
 * Do NOT re-parse btn.options.gracePeriodExpiry: it is a locale-formatted
 * display string (e.g. "11/30/2026, 07:00 PM EST"), not an ISO date, and
 * `new Date(...)` on it is unreliable across engines/locales.
 */
export const isAuthenticatorButtonInGracePeriod = (btn: AuthenticatorButtonElement): boolean => {
  const gp = btn.options as {
    gracePeriodRequiredDescription?: string;
    gracePeriodRemainingSkipsDescription?: string;
  };
  return !!(gp.gracePeriodRequiredDescription || gp.gracePeriodRemainingSkipsDescription);
};

const isGracePeriodExpiryStillActive = (expiry?: string): boolean => {
  if (!expiry) { return false; }
  const currentTimestampMs = Date.now();
  const gracePeriodTimestampMs = new Date(expiry).getTime();
  // eslint-disable-next-line no-restricted-globals
  return !isNaN(gracePeriodTimestampMs) && currentTimestampMs < gracePeriodTimestampMs;
};

export const hasActiveGroupGracePeriod = (group?: AuthenticatorGroup): boolean => {
  const gp = group?.gracePeriod;
  if (!gp) { return false; }
  return isGracePeriodExpiryStillActive(gp.expiry)
    || (typeof gp.remainingSkips === 'number' && gp.remainingSkips > 0);
};

const groupGracePeriodDescriptions = (
  gp: AuthenticatorGroupGracePeriod | undefined,
  languageTags?: string[],
): {
  gracePeriodExpiry?: string;
  gracePeriodRequiredDescription?: string;
  gracePeriodRemainingSkipsDescription?: string;
} => {
  if (!gp) { return {}; }
  const out: {
    gracePeriodExpiry?: string;
    gracePeriodRequiredDescription?: string;
    gracePeriodRemainingSkipsDescription?: string;
  } = {};

  if (gp.expiry && isGracePeriodExpiryStillActive(gp.expiry)) {
    const currentTimestampMs = Date.now();
    const gracePeriodEpochTimestampMs = new Date(gp.expiry).getTime();
    const remainingDays = TimeUtil.calculateDaysBetween(
      currentTimestampMs,
      gracePeriodEpochTimestampMs,
    );
    if (remainingDays === 1) {
      out.gracePeriodRequiredDescription = loc(
        'oie.enrollment.policy.grace.period.required.in.one.day',
        'login',
      );
    } else if (remainingDays > 1) {
      out.gracePeriodRequiredDescription = loc(
        'oie.enrollment.policy.grace.period.required.in.days',
        'login',
        [remainingDays],
      );
    } else {
      out.gracePeriodRequiredDescription = loc(
        'oie.enrollment.policy.grace.period.required.today',
        'login',
      );
    }
    if (Array.isArray(languageTags)) {
      out.gracePeriodExpiry = TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(
        new Date(gracePeriodEpochTimestampMs),
        languageTags,
        false,
      ) as string;
    }
    return out;
  }

  if (typeof gp.remainingSkips === 'number' && gp.remainingSkips > 0) {
    out.gracePeriodRemainingSkipsDescription = gp.remainingSkips === 1
      ? loc('oie.enrollment.policy.grace.period.required.in.one.skip', 'login')
      : loc(
        'oie.enrollment.policy.grace.period.required.in.number.of.skips',
        'login',
        [gp.remainingSkips],
      );
  }
  return out;
};

// Strip per-authenticator gracePeriod display fields from a button that renders
// inside a group card — the card's own group-level grace period at the top of
// the card is authoritative for every member row.
const stripPerButtonGracePeriod = (
  btn: AuthenticatorButtonElement,
): AuthenticatorButtonElement => ({
  ...btn,
  options: {
    ...btn.options,
    gracePeriodExpiry: undefined,
    gracePeriodRequiredDescription: undefined,
    gracePeriodRemainingSkipsDescription: undefined,
  },
});

// Copy a per-authenticator gracePeriod onto a button so the existing per-button
// GP rendering picks it up. Used when a group-of-1 has a group-level GP —
// rendering as a bare button, we inject the group GP into the member.
const injectGracePeriodIntoButton = (
  btn: AuthenticatorButtonElement,
  gp: AuthenticatorGroupGracePeriod,
  languageTags?: string[],
): AuthenticatorButtonElement => {
  const gpFields = groupGracePeriodDescriptions(gp, languageTags);
  return { ...btn, options: { ...btn.options, ...gpFields } };
};

/**
 * Partition button elements into group-aware section buckets.
 *
 * Fires when the response has at least one REQUIRED group with remaining > 0.
 * For each group:
 *   - remaining === 0 → hidden entirely
 *   - members.length === 1 → bare button, no card (group GP injected onto the
 *     button when present so per-button grace-period markup renders it)
 *   - members.length ≥ 2 → AuthenticatorGroupCardElement with a "Choose {N} of:"
 *     label, an optional group-level GP block, and the member buttons inside
 *     (per-button gracePeriod stripped — the card GP wins)
 *
 * Buttons not consumed by any active group fall into an "ungrouped" bucket for
 * the transformer to slot into the existing per-button gracePeriod split.
 */
export type GroupedSectionItem =
  | { kind: 'card'; card: AuthenticatorGroupCardElement }
  | { kind: 'bare'; button: AuthenticatorButtonElement };

export interface PartitionedGroupedButtons {
  requiredNow: GroupedSectionItem[];
  requiredSoon: GroupedSectionItem[];
  ungrouped: AuthenticatorButtonElement[];
}

// Bucket a single active group into the appropriate section, mutating the
// requiredNow/requiredSoon/emitted collections in place and returning the
// possibly-incremented cardIndex.
const bucketGroupIntoSections = (
  group: AuthenticatorGroup,
  buttons: AuthenticatorButtonElement[],
  cardIndex: number,
  requiredNow: GroupedSectionItem[],
  requiredSoon: GroupedSectionItem[],
  emitted: Set<AuthenticatorButtonElement>,
  languageTags?: string[],
): number => {
  const members = buttons.filter((btn) => (
    Array.isArray(btn.options.groupIds)
    && btn.options.groupIds.includes(group.groupId)
  ));
  if (members.length === 0) {
    return cardIndex;
  }
  const groupHasGP = hasActiveGroupGracePeriod(group);
  const bucket = groupHasGP ? requiredSoon : requiredNow;

  if (members.length === 1) {
    const [single] = members;
    const decorated = groupHasGP && group.gracePeriod
      ? injectGracePeriodIntoButton(single, group.gracePeriod, languageTags)
      : single;
    bucket.push({ kind: 'bare', button: decorated });
    emitted.add(single);
    return cardIndex;
  }

  const strippedMembers = members.map(stripPerButtonGracePeriod);
  const gpFields = group.gracePeriod
    ? groupGracePeriodDescriptions(group.gracePeriod, languageTags)
    : {};
  const card: AuthenticatorGroupCardElement = {
    type: 'AuthenticatorGroupCard',
    options: {
      groupIndex: cardIndex,
      remaining: group.remaining,
      buttons: strippedMembers,
      ...gpFields,
    },
  };
  bucket.push({ kind: 'card', card });
  members.forEach((m) => emitted.add(m));
  return cardIndex + 1;
};

export const partitionGroupedEnrollButtons = (
  buttons: AuthenticatorButtonElement[],
  groups: AuthenticatorGroup[],
  languageTags?: string[],
): PartitionedGroupedButtons => {
  const requiredNow: GroupedSectionItem[] = [];
  const requiredSoon: GroupedSectionItem[] = [];
  const emitted = new Set<AuthenticatorButtonElement>();

  groups.reduce((cardIndex, group) => {
    if (!group || group.remaining <= 0) {
      return cardIndex;
    }
    return bucketGroupIntoSections(
      group,
      buttons,
      cardIndex,
      requiredNow,
      requiredSoon,
      emitted,
      languageTags,
    );
  }, 0);

  const ungrouped = buttons.filter((btn) => !emitted.has(btn));
  return { requiredNow, requiredSoon, ungrouped };
};
