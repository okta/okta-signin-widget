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
import {
  IdxOption,
  IdxRemediationValue,
} from '@okta/okta-auth-js/lib/idx/types/idx-js';

import { AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP, AUTHENTICATOR_KEY } from '../../constants';
import {
  AuthenticatorOptionValue,
  Nullish,
  Option,
  Undefinable,
} from '../../types';

const getAuthenticatorOption = (
  options: IdxOption[],
  authenticatorKey: string,
): Undefinable<IdxOption> => options?.find(
  ({ relatesTo }) => relatesTo?.key === authenticatorKey,
);

const getOptionValue = (
  inputs: Input[],
  key: string,
): Nullish<Input> => inputs?.find(
  ({ name }) => name === key,
);

const buildOktaVerifyOptions = (
  options: IdxOption[],
  isEnroll?: boolean,
): Option<AuthenticatorOptionValue>[] => {
  const ovRemediation = getAuthenticatorOption(options, AUTHENTICATOR_KEY.OV);
  const id = (ovRemediation?.value as Input[])?.find(({ name }) => name === 'id')?.value;
  const methodType = (ovRemediation?.value as Input[])?.find(({ name }) => name === 'methodType');
  if (!methodType || !methodType.options?.length) {
    return [];
  }

  return methodType.options.map((option) => ({
    key: AUTHENTICATOR_KEY.OV,
    label: option.label,
    description: isEnroll && AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP[AUTHENTICATOR_KEY.OV],
    value: {
      label: isEnroll
        ? 'oie.enroll.authenticator.button.text'
        : 'oie.verify.authenticator.button.text',
      methodType: option.value,
      id,
    },
  } as Option<AuthenticatorOptionValue>));
};

const getAuthenticatorDescription = (
  options: IdxOption[],
  authenticatorKey: string,
  isEnroll?: boolean,
): Undefinable<string> => {
  if (!authenticatorKey) {
    return undefined;
  }

  if (isEnroll) {
    return AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP[authenticatorKey];
  }

  if (authenticatorKey === AUTHENTICATOR_KEY.PHONE) {
    return getAuthenticatorOption(
      options,
      AUTHENTICATOR_KEY.PHONE,
    // @ts-ignore OKTA-499921 (profile missing from relatesTo interface)
    )?.relatesTo?.profile?.phoneNumber;
  }
  return undefined;
};

const getOnPremDescriptionParams = (
  options: IdxOption[],
  authenticatorKey: string,
  isEnroll?: boolean,
): Undefinable<string[]> => {
  if (!isEnroll || authenticatorKey !== AUTHENTICATOR_KEY.ON_PREM) {
    return undefined;
  }

  const vendorName = getAuthenticatorOption(
    options,
    AUTHENTICATOR_KEY.ON_PREM,
  )?.relatesTo?.displayName || 'oie.on_prem.authenticator.default.vendorName';
  return [vendorName];
};

const formatAuthenticatorOptions = (
  options: IdxOption[],
  isEnroll?: boolean,
): Option<AuthenticatorOptionValue>[] => (
  options.map((option: IdxOption) => {
    const authenticatorKey = option.relatesTo?.key as string;
    const id = getOptionValue(option?.value as Input[], 'id')?.value;
    const methodType = getOptionValue(option?.value as Input[], 'methodType')?.value;
    const enrollmentId = getOptionValue(option?.value as Input[], 'enrollmentId')?.value;

    return {
      key: authenticatorKey,
      label: option.label,
      description: getAuthenticatorDescription(
        options,
        authenticatorKey,
        isEnroll,
      ),
      descriptionParams: getOnPremDescriptionParams(
        options,
        authenticatorKey,
        isEnroll,
      ),
      value: {
        key: authenticatorKey,
        label: isEnroll
          ? 'oie.enroll.authenticator.button.text'
          : 'oie.verify.authenticator.button.text',
        id,
        methodType,
        enrollmentId,
      } as AuthenticatorOptionValue,
    };
  })
);

const getAuthenticatorOptions = (
  options: IdxOption[],
  isEnroll?: boolean,
): Option<AuthenticatorOptionValue>[] => {
  const formattedOptions = formatAuthenticatorOptions(options, isEnroll);

  // appending OV options back to its original spot
  const ovOptions = buildOktaVerifyOptions(options, isEnroll);
  if (ovOptions.length && options?.length) {
    const ovIndex = options.findIndex(({ relatesTo }) => relatesTo?.key === AUTHENTICATOR_KEY.OV);
    formattedOptions.splice(ovIndex, 1, ...ovOptions);
  }

  return formattedOptions;
};

export const getOVMethodTypeAuthenticatorOptions = (
  options?: IdxOption[],
): Option<AuthenticatorOptionValue>[] => {
  if (!options) {
    return [];
  }

  return options.map((option) => ({
    key: AUTHENTICATOR_KEY.OV,
    label: option.label,
    value: {
      label: 'oie.verify.authenticator.button.text',
      methodType: option.value as string,
    },
  }));
};

export const isOnlyPushWithAutoChallenge = (
  authenticatorRemediation?: IdxRemediationValue,
): boolean => {
  const methodType = (authenticatorRemediation?.form?.value)
    ?.find(({ name }) => name === 'methodType');
  const autoChallenge = (authenticatorRemediation?.form?.value)
    ?.find(({ name }) => name === 'autoChallenge');

  return typeof autoChallenge !== 'undefined'
    && methodType?.options?.length === 1
    && methodType.options[0].value === 'push';
};

export const getAuthenticatorVerifyOptions = (
  authenticatorOptions: IdxOption[],
): Option<AuthenticatorOptionValue>[] => getAuthenticatorOptions(
  authenticatorOptions,
);

export const getAuthenticatorEnrollOptions = (
  authenticatorOptions: IdxOption[],
): Option<AuthenticatorOptionValue>[] => getAuthenticatorOptions(
  authenticatorOptions,
  true,
);
