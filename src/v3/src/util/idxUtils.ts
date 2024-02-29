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

import {
  APIError,
  FieldError,
  IdxMessage,
  IdxMessages,
  IdxRemediation,
  IdxStatus,
  IdxTransaction,
  Input,
  NextStep,
  ProceedOptions,
} from '@okta/okta-auth-js';
import { IdxForm } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';
import { StateUpdater } from 'preact/hooks';

import { getMessage } from '../../../v2/ion/i18nUtils';
import {
  AUTHENTICATOR_KEY,
  CONSENT_HEADER_STEPS,
  DEVICE_ENROLLMENT_TYPE,
  EMAIL_AUTHENTICATOR_TERMINAL_KEYS,
  IDX_STEP,
  SUPPORTED_SERVER_GENERATED_SCHEMA_REMEDIATIONS,
} from '../constants';
import {
  AppInfo,
  AuthCoinProps,
  IWidgetContext,
  PhoneVerificationMethodType,
  RegistrationElementSchema,
  RequiredKeys,
  UserInfo,
  WidgetMessage,
  WidgetProps,
} from '../types';
import { flattenInputs } from './flattenInputs';
import { getAuthenticatorKey } from './getAuthenticatorKey';
import { getCurrentAuthenticator } from './getCurrentAuthenticator';
import { loc } from './locUtil';
import { resetMessagesToInputs } from './resetMessagesToInputs';

type RegistrationFieldError = FieldError & { property: string };

export const getUserInfo = (transaction: IdxTransaction): UserInfo => {
  const { context: { user } } = transaction;

  if (!user) {
    return {};
  }
  return user.value as UserInfo;
};

export const getAppInfo = (transaction: IdxTransaction): AppInfo => {
  // @ts-expect-error OKTA-598868 app is missing from rawIdxState type
  const { rawIdxState: { app } } = transaction;

  if (!app) {
    return {};
  }
  return app.value as AppInfo;
};

export const containsMessageKey = (
  key: string,
  messages?: WidgetMessage[],
): boolean => (messages?.some((message) => message.i18n?.key === key) ?? false);

export const containsMessageKeyPrefix = (
  prefix: string,
  messages?: WidgetMessage[],
): boolean => (messages?.some((message) => message.i18n?.key?.startsWith(prefix)) ?? false);

export const containsOneOfMessageKeys = (
  keys: string[],
  messages?: WidgetMessage[],
): boolean => keys.some((key) => containsMessageKey(key, messages));

export const updatePasswordRequirementsNotMetMessage = (
  messages: IdxMessage[],
): IdxMessage[] => (
  messages.map((message) => {
    if (message.i18n?.key?.includes('password.passwordRequirementsNotMet')) {
      return {
        ...message,
        i18n: {
          key: 'registration.error.password.passwordRequirementsNotMet',
          params: undefined,
        },
        message: loc('registration.error.password.passwordRequirementsNotMet', 'login'),
      };
    }
    return message;
  })
);

export const buildAuthCoinProps = (
  transaction?: IdxTransaction | null,
): AuthCoinProps | undefined => {
  if (!transaction) {
    return undefined;
  }

  const { nextStep, messages } = transaction;
  if (containsOneOfMessageKeys(EMAIL_AUTHENTICATOR_TERMINAL_KEYS, messages)
    || nextStep?.name === IDX_STEP.CONSENT_EMAIL_CHALLENGE) {
    return { authenticatorKey: AUTHENTICATOR_KEY.EMAIL };
  }

  if (nextStep?.name === IDX_STEP.PIV_IDP) {
    return { authenticatorKey: IDX_STEP.PIV_IDP };
  }

  // @ts-expect-error Property 'deviceEnrollment' does not exist on type 'IdxContext' ts(2339)
  if (transaction.context?.deviceEnrollment?.value?.name === DEVICE_ENROLLMENT_TYPE.ODA) {
    return { authenticatorKey: AUTHENTICATOR_KEY.OV };
  }

  const authenticatorKey = getAuthenticatorKey(transaction);
  if (authenticatorKey) {
    return {
      authenticatorKey,
      // @ts-ignore logoUri missing from interface
      url: nextStep?.relatesTo?.value.logoUri,
    };
  }

  return undefined;
};

export const hasMinAuthenticatorOptions = (
  transaction: IdxTransaction,
  stepName: string,
  min: number,
): boolean => {
  const excludedPages = [
    IDX_STEP.SELECT_AUTHENTICATOR_ENROLL,
    IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
  ];
  if (excludedPages.includes(transaction.nextStep?.name ?? '')) {
    return false;
  }

  const remediation: IdxRemediation | undefined = transaction.neededToProceed.find(
    ({ name }) => name === stepName,
  );
  if (!remediation) {
    return false;
  }

  const authenticatorInput = remediation.value?.find(({ name }) => name === 'authenticator');
  if (!authenticatorInput) {
    return false;
  }

  // OV options are under methods
  const ovOption = authenticatorInput.options?.find(
    (opt) => opt.relatesTo?.key === AUTHENTICATOR_KEY.OV,
  )?.relatesTo;

  return (
    (authenticatorInput?.options?.length ?? 0) > min
    || (ovOption?.methods?.length ?? 0) > min
  );
};

export const isAuthClientSet = (
  props: WidgetProps,
): props is RequiredKeys<WidgetProps, 'authClient'> => !!props.authClient;

export const areTransactionsEqual = (
  tx1: IdxTransaction | undefined,
  tx2: IdxTransaction | undefined,
): boolean => {
  if (tx1?.nextStep?.name !== tx2?.nextStep?.name) {
    return false;
  }

  const tx1AuthKey = tx1 && getAuthenticatorKey(tx1);
  const tx2AuthKey = tx2 && getAuthenticatorKey(tx2);
  if (tx1AuthKey !== tx2AuthKey) {
    return false;
  }

  const tx1AuthId = typeof tx1 !== 'undefined'
    ? getCurrentAuthenticator(tx1)?.value?.id
    : undefined;
  const tx2AuthId = typeof tx2 !== 'undefined'
    ? getCurrentAuthenticator(tx2)?.value?.id
    : undefined;
  if (tx1AuthId !== tx2AuthId) {
    return false;
  }

  // on the safe mode poll remediation (IDX_STEP.POLL) we _always_
  // want to view the incoming poll transaction as unequal to force
  // the transformer to run again and re-render the view
  if (typeof tx2 !== 'undefined' && tx2.nextStep?.name === IDX_STEP.POLL) {
    return false;
  }

  return true;
};

export const updateTransactionWithNextStep = (
  transaction: IdxTransaction,
  nextStep: NextStep,
  widgetContext: IWidgetContext,
): void => {
  const {
    setIdxTransaction, setIsClientTransaction, setMessage, setStepToRender,
  } = widgetContext;
  const availableSteps = transaction.availableSteps?.filter(
    ({ name }) => name !== nextStep.name,
  ) || [];
  const verifyWithOtherRemediations = transaction.neededToProceed.find(
    ({ name }) => name === nextStep.name,
  ) || {} as IdxRemediation;
  const availableRemediations = transaction.neededToProceed.filter(
    ({ name }) => name !== nextStep.name,
  );

  setMessage(undefined);
  setStepToRender(undefined);
  setIsClientTransaction(false);
  setIdxTransaction({
    ...transaction,
    messages: [],
    neededToProceed: [
      verifyWithOtherRemediations,
      ...availableRemediations,
    ],
    availableSteps: [
      nextStep,
      ...availableSteps,
    ],
    nextStep,
  });
};

export const convertIdxMessageToWidgetMessage = (
  messages?: any[],
): WidgetMessage[] | undefined => messages?.map((message) => {
  // If message is an array, it has already been translated earlier in the flow
  if (Array.isArray(message?.message)) {
    return message as WidgetMessage;
  }
  return {
    ...(message as IdxMessage),
    message: getMessage(message),
  };
});

export const convertIdxInputsToRegistrationSchema = (
  inputs: Input[],
): RegistrationElementSchema[] => (
  inputs.reduce((acc: Input[], input: Input) => {
    const flattenedInputs = flattenInputs(input);
    return [...acc, ...flattenedInputs];
  }, []).map((flattenedInput: Input) => ({
    ...flattenedInput,
    'label-top': true,
    'data-se': flattenedInput.name,
    wide: true,
  } as RegistrationElementSchema))
);

export const convertRegistrationSchemaToIdxInputs = (
  schema: RegistrationElementSchema[],
  idxInputs: Input[],
): void => {
  schema.forEach((schemaEle: RegistrationElementSchema) => {
    if (schemaEle.name?.includes('.')) {
      // nested object (only go one level deep)
      const [schemaGroupName, schemaGrpFieldName] = schemaEle.name.split('.');
      const inputGroupIndex = idxInputs.findIndex(({ name }) => name === schemaGroupName);
      if (inputGroupIndex !== -1 && Array.isArray(idxInputs[inputGroupIndex]?.value)) {
        // Existing input
        const inputGroupFieldIndex = (
          idxInputs[inputGroupIndex]?.value as Input[]
        )?.findIndex(({ name }) => name === schemaGrpFieldName);
        if (inputGroupFieldIndex !== -1 && Array.isArray(idxInputs[inputGroupIndex].value)) {
          // Update existing field
          const srcObj = (idxInputs[inputGroupIndex].value as Input[])[inputGroupFieldIndex];
          Object.assign(srcObj, { ...schemaEle, name: schemaGrpFieldName });
        } else {
          // Add new field
          const schemaInputField = { ...schemaEle, name: schemaGrpFieldName };
          (idxInputs[inputGroupIndex].value as Record<string, unknown>[]).push(schemaInputField);
        }
      } else {
        // New top level input
        idxInputs.push({
          name: schemaGroupName,
          type: 'object',
          required: schemaEle.required,
          // @ts-expect-error Registration Schema Element has extra fields that are not in Input
          value: { ...schemaEle, name: schemaGrpFieldName },
        });
      }
    } else {
      // not nested
      const existFieldIdx = idxInputs.findIndex(({ name }) => name === schemaEle.name);
      if (existFieldIdx !== -1) {
        // Existing Field (modify)
        Object.assign(idxInputs[existFieldIdx], schemaEle);
      } else {
        // New Field (create)
        // @ts-expect-error Registration Schema Element has extra fields that are not in Input
        idxInputs.push(schemaEle);
      }
    }
  });
};

export const triggerRegistrationErrorMessages = (
  error: APIError,
  inputs: Input[],
  setMessage: StateUpdater<IdxMessage | undefined>,
): void => {
  if (Array.isArray(error.errorCauses)) {
    // field level error messages
    const messagesByField: Record<string, WidgetMessage[]> = error.errorCauses
      .reduce((acc, err) => {
        const { errorSummary, property } = err as RegistrationFieldError;
        return {
          ...acc,
          [property]: [{ class: 'ERROR', message: errorSummary }],
        };
      }, {});
    resetMessagesToInputs(inputs, messagesByField);
  }

  setMessage({
    class: 'ERROR',
    i18n: { key: '' },
    message: error.errorSummary || loc('oform.errorbanner.title', 'login'),
  });
};

export const getDisplayName = (transaction: IdxTransaction): string | undefined => {
  const authenticator = getCurrentAuthenticator(transaction);
  return authenticator?.value?.displayName;
};

export const isVerifyFlow = (transaction: IdxTransaction): boolean => {
  // currentAuthenticator is from enrollment flows and currentAuthenticatorEnrollment is from verify flows
  const { context: { currentAuthenticatorEnrollment } } = transaction;
  return typeof currentAuthenticatorEnrollment !== 'undefined';
};

// @ts-expect-error OKTA-627610 captcha missing from context type
export const isCaptchaEnabled = (transaction: IdxTransaction): boolean => typeof transaction.context?.captcha !== 'undefined';

export const isConsentStep = (transaction?: IdxTransaction): boolean => (
  transaction?.nextStep?.name
    ? CONSENT_HEADER_STEPS.includes(transaction.nextStep.name)
    : false
);

export const getApplicationName = (transaction?: IdxTransaction): string | null => {
  if (typeof transaction === 'undefined') {
    return null;
  }

  const { label } = getAppInfo(transaction);
  return label ?? null;
};

export const triggerEmailVerifyCallback = async (props: WidgetProps): Promise<IdxTransaction> => {
  if (!isAuthClientSet(props)) {
    throw new Error('authClient is required');
  }

  const { authClient, otp } = props;
  const idxOptions: ProceedOptions = {
    exchangeCodeForTokens: false,
  };
  const meta = await authClient.idx.getSavedTransactionMeta(); // meta can load in another tab using state if it matches

  if (!meta || !meta.interactionHandle) {
    // Flow can not continue in this tab. Create a synthetic server response and use it to display a message to the user
    const messages: IdxMessages = {
      type: 'array',
      value: [
        {
          message: 'Enter the OTP in your original authentication location.',
          i18n: {
            key: 'idx.enter.otp.in.original.tab',
          },
          class: 'INFO',
        },
      ],
    };

    const syntheticTransaction: IdxTransaction = {
      status: IdxStatus.TERMINAL,
      messages: messages.value,
      // @ts-expect-error
      rawIdxState: {
        messages,
      },
      // @ts-expect-error
      context: {
        messages,
      },
    };
    return syntheticTransaction;
  }

  const transaction: IdxTransaction = await authClient.idx.proceed({
    ...idxOptions,
    otp,
  });
  return transaction;
};

export const isValidPhoneMethodType = (
  methodType?: string | { form: IdxForm; } | Input[],
): methodType is PhoneVerificationMethodType => (
  typeof methodType !== 'undefined' && (methodType === 'sms' || methodType === 'voice')
);

export const isServerGeneratedSchemaAvailable = (
  widgetProps: WidgetProps,
  idxTransaction?: IdxTransaction,
): boolean => {
  const { features: { serverGeneratedUISchemaEnabled } = {} } = widgetProps;
  if (!serverGeneratedUISchemaEnabled || typeof idxTransaction === 'undefined') {
    return false;
  }

  const { rawIdxState, neededToProceed } = idxTransaction;
  const nextStepIsSupported = SUPPORTED_SERVER_GENERATED_SCHEMA_REMEDIATIONS.some(
    (step) => neededToProceed?.[0]?.name === step,
  );
  // @ts-ignore uischema is missing from RawIdxState type
  return typeof rawIdxState?.uischema !== 'undefined' && nextStepIsSupported;
};
