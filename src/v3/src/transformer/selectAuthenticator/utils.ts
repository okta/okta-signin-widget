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
import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { loc } from 'okta';

import { AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP, AUTHENTICATOR_KEY } from '../../constants';
import { AuthenticatorButtonElement } from '../../types';

const getAuthenticatorOption = (
  options: IdxOption[],
  authenticatorKey: string,
): IdxOption | undefined => options?.find(
  ({ relatesTo }) => relatesTo?.key === authenticatorKey,
);

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

const buildOktaVerifyOptions = (
  options: IdxOption[],
  isEnroll?: boolean,
): AuthenticatorButtonElement[] => {
  const ovRemediation = getAuthenticatorOption(options, AUTHENTICATOR_KEY.OV);
  const id = (ovRemediation?.value as Input[])?.find(({ name }) => name === 'id')?.value;
  const methodType = (ovRemediation?.value as Input[])?.find(({ name }) => name === 'methodType');
  if (!methodType || !methodType.options?.length) {
    return [];
  }

  return methodType.options.map((option) => ({
    type: 'AuthenticatorButton',
    label: option.label,
    options: {
      key: AUTHENTICATOR_KEY.OV,
      ctaLabel: isEnroll
        ? loc('oie.enroll.authenticator.button.text', 'login')
        : loc('oie.verify.authenticator.button.text', 'login'),
      description: isEnroll && loc(AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP[AUTHENTICATOR_KEY.OV], 'login'),
      actionParams: {
        'authenticator.methodType': option.value,
        'authenticator.id': id,
      },
      dataSe: getAuthenticatorDataSeVal(AUTHENTICATOR_KEY.OV, option.value as string),
    },
  })) as AuthenticatorButtonElement[];
};

const getOnPremDescriptionParams = (
  options: IdxOption[],
  authenticatorKey: string,
  isEnroll?: boolean,
): string[] | undefined => {
  const authenticatorDescrWithParams = [
    AUTHENTICATOR_KEY.ON_PREM,
    AUTHENTICATOR_KEY.IDP,
    AUTHENTICATOR_KEY.CUSTOM_APP,
    AUTHENTICATOR_KEY.SYMANTEC_VIP,
  ]
  if (!isEnroll || !authenticatorDescrWithParams.includes(authenticatorKey)) {
    return undefined;
  }

  switch(authenticatorKey) {
    case AUTHENTICATOR_KEY.ON_PREM:
      const vendorName = getAuthenticatorOption(
        options,
        authenticatorKey,
      )?.relatesTo?.displayName || loc('oie.on_prem.authenticator.default.vendorName', 'login');
      return [vendorName];
    case AUTHENTICATOR_KEY.IDP:
      const idpName = getAuthenticatorOption(
        options,
        authenticatorKey,
      )?.relatesTo?.displayName || '';
      return [idpName];
    case AUTHENTICATOR_KEY.CUSTOM_APP:
      const customAppName = getAuthenticatorOption(
        options,
        authenticatorKey,
      )?.label || '';
      return [customAppName];
    case AUTHENTICATOR_KEY.SYMANTEC_VIP:
      const appName = getAuthenticatorOption(
        options,
        authenticatorKey,
      )?.relatesTo?.displayName || '';
      return [appName];
  }
  return undefined;
};

const getAuthenticatorDescription = (
  options: IdxOption[],
  authenticatorKey: string,
  isEnroll?: boolean,
): string | undefined => {
  if (!authenticatorKey) {
    return undefined;
  }
  const descrParams = getOnPremDescriptionParams(
    options,
    authenticatorKey,
    isEnroll,
  );
  if (isEnroll) {
    return loc(AUTHENTICATOR_ENROLLMENT_DESCR_KEY_MAP[authenticatorKey], 'login', descrParams);
  }

  if (authenticatorKey === AUTHENTICATOR_KEY.PHONE) {
    return getAuthenticatorOption(
      options,
      authenticatorKey,
    )?.relatesTo?.profile?.phoneNumber as string || undefined;
  }

  if (authenticatorKey === AUTHENTICATOR_KEY.CUSTOM_APP) {
    return getAuthenticatorOption(
      options,
      authenticatorKey,
    )?.relatesTo?.displayName as string || undefined;
  }

  if (authenticatorKey === AUTHENTICATOR_KEY.OV) {
    return loc('oie.okta_verify.label', 'login');
  }
  return undefined;
};

const formatAuthenticatorOptions = (
  options: IdxOption[],
  isEnroll?: boolean,
): AuthenticatorButtonElement[] => (
  options.map((option: IdxOption) => {
    const authenticatorKey = option.relatesTo?.key as string;
    const id = getOptionValue(option.value as Input[], 'id')?.value;
    const methodType = getOptionValue(option.value as Input[], 'methodType')?.value;
    const enrollmentId = getOptionValue(option.value as Input[], 'enrollmentId')?.value;
    
    return {
      type: 'AuthenticatorButton',
      label: option.label,
      options: {
        key: authenticatorKey,
        ctaLabel: isEnroll
          ? loc('oie.enroll.authenticator.button.text', 'login')
          : loc('oie.verify.authenticator.button.text', 'login'),
        description: getAuthenticatorDescription(
          options,
          authenticatorKey,
          isEnroll,
        ),
        actionParams: {
          'authenticator.id': id,
          'authenticator.methodType': methodType,
          'authenticator.enrollmentId': enrollmentId,
        },
        dataSe: getAuthenticatorDataSeVal(
          authenticatorKey,
          typeof methodType === 'string' ? methodType : undefined,
        ),
      },
    } as AuthenticatorButtonElement;
  })
);

const getAuthenticatorButtonElements = (
  options: IdxOption[],
  isEnroll?: boolean,
): AuthenticatorButtonElement[] => {
  const formattedOptions = formatAuthenticatorOptions(options, isEnroll);

  // appending OV options back to its original spot
  const ovOptions = buildOktaVerifyOptions(options, isEnroll);
  if (ovOptions.length && options?.length) {
    const ovIndex = options.findIndex(({ relatesTo }) => relatesTo?.key === AUTHENTICATOR_KEY.OV);
    formattedOptions.splice(ovIndex, 1, ...ovOptions);
  }

  return formattedOptions;
};

export const getOVMethodTypeAuthenticatorButtonElements = (
  options: IdxOption[],
): AuthenticatorButtonElement[] => {
  if (!options.length) {
    return [];
  }

  return options.map((option) => ({
    type: 'AuthenticatorButton',
    label: option.label,
    options: {
      key: AUTHENTICATOR_KEY.OV,
      ctaLabel: loc('oie.verify.authenticator.button.text', 'login'),
      actionParams: {
        'authenticator.methodType': (option.value as string),
      },
    },
  })) as AuthenticatorButtonElement[];
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
):AuthenticatorButtonElement[] => getAuthenticatorButtonElements(
  authenticatorOptions,
);

export const getAuthenticatorEnrollButtonElements = (
  authenticatorOptions: IdxOption[],
): AuthenticatorButtonElement[] => getAuthenticatorButtonElements(
  authenticatorOptions,
  true,
);
