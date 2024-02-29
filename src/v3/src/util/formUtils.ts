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
  IdxAuthenticator,
  IdxMessage, IdxRemediation, IdxTransaction, NextStep,
} from '@okta/okta-auth-js';
import classNames from 'classnames';

import IDP from '../../../util/IDP';
import Util from '../../../util/Util';
import {
  CUSTOM_APP_UV_ENABLE_BIOMETRIC_SERVER_KEY, IDX_STEP, SOCIAL_IDP_TYPE_TO_I18KEY, TERMINAL_KEY,
} from '../constants';
import SmartCardIconSvg from '../img/smartCardButtonIcon.svg';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  InfoboxElement,
  IWidgetContext,
  LaunchAuthenticatorButtonElement,
  LayoutAlignment,
  PhoneVerificationMethodType,
  WidgetMessage,
  WidgetMessageLink,
  WidgetProps,
} from '../types';
import { idpIconMap } from './idpIconMap';
import { loc } from './locUtil';

export type PhoneVerificationStep = typeof IDX_STEP.CHALLENGE_AUTHENTICATOR
| typeof IDX_STEP.AUTHENTICATOR_VERIFICATION_DATA;

export const handleFormFieldChange = (
  path: string,
  // eslint-disable-next-line
  value: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleChange: (path: string, value: any) => void,
  setPristineFn?: ((pristine: boolean) => void),
  setTouchedFn?: ((touched: boolean) => void),
  setUntouchedFn?: ((untouched: boolean) => void),
  setDirtyFn?: ((isDirty: boolean) => void),
): void => {
  setPristineFn?.(false);
  setTouchedFn?.(true);
  setUntouchedFn?.(false);
  setDirtyFn?.(true);
  handleChange(path, value);
};

export const handleFormFieldBlur = (
  setPristineFn?: ((pristine: boolean) => void),
  setTouchedFn?: ((touched: boolean) => void),
  setUntouchedFn?: ((untouched: boolean) => void),
): void => {
  setPristineFn?.(false);
  setTouchedFn?.(true);
  setUntouchedFn?.(false);
};

export const getCustomButtonElements = (widgetProps: WidgetProps): ButtonElement[] => {
  const { customButtons = [] } = widgetProps;
  return customButtons.map((customButton) => {
    const customButtonElement: ButtonElement = {
      type: 'Button',
      label: customButton.title ?? loc(customButton.i18nKey, 'login'),
      options: {
        type: ButtonType.BUTTON,
        step: '',
        dataSe: customButton.dataAttr,
        classes: classNames(customButton.className, 'default-custom-button'),
        variant: 'secondary',
        onClick: customButton.click,
      },
    };
    return customButtonElement;
  });
};

const getPIVButtonElement = (
  transaction: IdxTransaction,
  widgetProps: WidgetProps,
) : ButtonElement[] => {
  const { neededToProceed: remediations } = transaction;
  const { piv } = widgetProps;
  const pivRemediations = remediations.filter((idp) => idp.name === IDX_STEP.PIV_IDP);

  if (pivRemediations.length < 1) {
    return [];
  }

  return [{
    type: 'Button',
    label: piv?.text || loc('piv.cac.card', 'login'),
    options: {
      type: ButtonType.BUTTON,
      step: IDX_STEP.PIV_IDP,
      dataSe: 'piv-card-button',
      classes: `${piv?.className || ''} piv-button`,
      variant: 'secondary',
      Icon: SmartCardIconSvg,
      iconAlt: loc('piv.card', 'login'),
      onClick: (widgetContext: IWidgetContext) => {
        // To render the PIV view, we have to use a remediation that is provided on initial load
        // This remediation doesn't allow a network request, so we have to update the transaction
        // to set the NextStep as the PIV remediation and change the step name to match what
        // the transaction transformers expect to render PIV View.
        // NOTE: IDPs and PIV share the same remediation step name, this is why we update the name
        // for PIV
        // Additionally, we clear the messages and other remediations from the PIV view
        // to prevent the widget from displaying elements that are not related to PIV
        const { setIdxTransaction } = widgetContext;
        setIdxTransaction({
          ...transaction,
          messages: [],
          neededToProceed: pivRemediations,
          availableSteps: pivRemediations as NextStep[],
          nextStep: pivRemediations.find(({ name }) => name === IDX_STEP.PIV_IDP) as NextStep,
        });
      },
    },
  } as ButtonElement];
};

export const getFastPassButtonElement = (
  transaction: IdxTransaction,
) : LaunchAuthenticatorButtonElement[] => {
  const { context, neededToProceed: remediations } = transaction;
  const containsLaunchAuthenticator = remediations.some(
    (remediation) => remediation.name === IDX_STEP.LAUNCH_AUTHENTICATOR,
  );

  if (!containsLaunchAuthenticator) {
    return [];
  }

  const launchAuthenticatorButton: LaunchAuthenticatorButtonElement = {
    type: 'LaunchAuthenticatorButton',
    label: loc('oktaVerify.button', 'login'),
    options: {
      step: IDX_STEP.LAUNCH_AUTHENTICATOR,
      // @ts-expect-error authenticatorChallenge missing from transaction context type
      deviceChallengeUrl: context?.authenticatorChallenge?.value?.href,
      // @ts-expect-error authenticatorChallenge missing from transaction context type
      challengeMethod: context?.authenticatorChallenge?.value?.challengeMethod,
    },
  };

  return [launchAuthenticatorButton];
};

/**
 * To support `idps` configuration in OIE.
 * Gets IDP buttons from widget config that are not already present in transaction remediations.
 * https://github.com/okta/okta-signin-widget#openid-connect
 */
const getConfigIdpButtonRemediations = (
  transaction: IdxTransaction,
  widgetProps: WidgetProps,
) : IdxRemediation[] => {
  const widgetRemediations = transaction.neededToProceed;
  // @ts-expect-error OKTA-609461 - idps missing from WidgetProps type
  const idpsConfig = widgetProps.idps;

  if (Array.isArray(idpsConfig)) {
    const existsRedirectIdpIds: Record<string, boolean> = {};
    widgetRemediations.forEach((r) => {
      if (r.name === IDX_STEP.REDIRECT_IDP && r.idp) {
        existsRedirectIdpIds[r.idp.id] = true;
      }
    });
    const { baseUrl } = widgetProps;
    const { stateHandle } = transaction.context;
    return idpsConfig
      .filter((c) => !existsRedirectIdpIds[c.id]) // omit idps that are already in remediation.
      .map((idpConfig) => {
        const idp = {
          id: idpConfig.id,
          name: idpConfig.text,
        };
        const redirectUri = `${baseUrl}/sso/idps/${idpConfig.id}?stateToken=${stateHandle}`;
        if (idpConfig.className) {
          // @ts-expect-error OKTA-609464 - className missing from IdpConfig type
          idp.className = idpConfig.className;
        }
        return {
          name: IDX_STEP.REDIRECT_IDP,
          type: idpConfig.type,
          idp,
          href: redirectUri,
        };
      });
  }

  return [];
};

/**
 * Example of `redirect-idp` remediation.
 * {
 *   "name": "redirect-idp",
 *   "type": "MICROSOFT",
 *   "idp": {
 *      "id": "0oa2szc1K1YPgz1pe0g4",
 *      "name": "Microsoft IDP"
 *    },
 *   "href": "http://localhost:3000/sso/idps/0oa2szc1K1YPgz1pe0g4?stateToken=BB...AA",
 *   "method": "GET"
 * }
 *
 */
export const getIdpButtonElements = (
  transaction: IdxTransaction,
  widgetProps: WidgetProps,
) : ButtonElement[] => {
  const { neededToProceed: remediations } = transaction;
  let redirectIdpRemediations = remediations.filter(
    (idp) => idp.name === IDX_STEP.REDIRECT_IDP,
  ) || [];
  // Add Idp buttons from widget config (openid-connect)
  redirectIdpRemediations = redirectIdpRemediations.concat(
    getConfigIdpButtonRemediations(transaction, widgetProps),
  );

  // create button elements from idp objects
  const idpButtonElements = redirectIdpRemediations.map((idpObject) => {
    let type = idpObject.type?.toLowerCase() || '';
    let displayName;

    const buttonI18key = SOCIAL_IDP_TYPE_TO_I18KEY[type];
    if (IDP.SUPPORTED_SOCIAL_IDPS.includes(type) === false || typeof buttonI18key === 'undefined') {
      type = 'general-idp';
      // OKTA-396684 - makes sure that custom idps always have a name
      displayName = loc('customauth.sign.in.with.label', 'login', [idpObject.idp?.name]);
    } else {
      displayName = loc(buttonI18key, 'login');
    }

    return {
      type: 'Button',
      label: displayName,
      options: {
        type: ButtonType.BUTTON,
        step: IDX_STEP.PIV_IDP,
        dataSe: 'piv-card-button',
        classes: classNames(
          'social-auth-button',
          `social-auth-${type}-button`,
          // @ts-expect-error OKTA-609464 - className missing from IdpConfig type
          idpObject.idp?.className,
          { 'no-translate': type === 'general-idp' },
        ),
        variant: 'secondary',
        Icon: idpIconMap[type],
        iconAlt: '',
        onClick: () => {
          Util.redirectWithFormGet(idpObject.href);
        },
      },
    } as ButtonElement;
  });

  // create piv button element to be added
  const pivButtonElement = getPIVButtonElement(transaction, widgetProps);

  return [...pivButtonElement, ...idpButtonElements];
};

export const getBiometricsErrorMessageElement = (
  messageKey: string | undefined,
  displayName?: string,
): WidgetMessage => {
  let title;
  let customMessage;
  let messageBullets = [];

  if (messageKey === CUSTOM_APP_UV_ENABLE_BIOMETRIC_SERVER_KEY) {
    title = loc('oie.authenticator.custom_app.method.push.verify.enable.biometrics.title', 'login', [displayName]);
    customMessage = loc('oie.authenticator.custom_app.method.push.verify.enable.biometrics.description', 'login');
    messageBullets = [
      loc('oie.authenticator.custom_app.method.push.verify.enable.biometrics.point1', 'login'),
      loc('oie.authenticator.custom_app.method.push.verify.enable.biometrics.point2', 'login', [displayName]),
      loc('oie.authenticator.custom_app.method.push.verify.enable.biometrics.point3', 'login', [displayName]),
    ];
  } else {
    title = loc('oie.authenticator.app.method.push.verify.enable.biometrics.title', 'login');
    customMessage = loc('oie.authenticator.app.method.push.verify.enable.biometrics.description', 'login');
    messageBullets = [
      loc('oie.authenticator.app.method.push.verify.enable.biometrics.point1', 'login'),
      loc('oie.authenticator.app.method.push.verify.enable.biometrics.point2', 'login'),
      loc('oie.authenticator.app.method.push.verify.enable.biometrics.point3', 'login'),
    ];
  }

  return {
    class: 'ERROR',
    title,
    description: customMessage,
    message: messageBullets.map((msg: string) => ({ class: 'INFO', message: msg })) as WidgetMessage[],
  };
};

export const buildEndUserRemediationError = (messages: IdxMessage[]) :
InfoboxElement | undefined => {
  if (messages.length === 0) {
    return undefined;
  }

  const I18N_KEY_PREFIX = TERMINAL_KEY.END_USER_REMEDIATION_ERROR_PREFIX;
  const HELP_AND_CONTACT_KEY_PREFIX = `${I18N_KEY_PREFIX}.additional_help_`;
  const REMEDIATION_OPTION_INDEX_KEY = `${I18N_KEY_PREFIX}.option_index`;
  const TITLE_KEY = `${I18N_KEY_PREFIX}.title`;
  const resultMessageArray: WidgetMessage[] = [];

  messages.forEach((msg) => {
    // @ts-expect-error OKTA-630508 links is missing from IdxMessage type
    const { i18n: { key, params }, links, message } = msg;

    const widgetMsg = { listStyleType: 'disc' } as WidgetMessage;
    if (key === TITLE_KEY) {
      widgetMsg.title = loc(TITLE_KEY, 'login');
    } else if (key === REMEDIATION_OPTION_INDEX_KEY) {
      widgetMsg.title = loc(REMEDIATION_OPTION_INDEX_KEY, 'login', params);
    } else if (key.startsWith(HELP_AND_CONTACT_KEY_PREFIX)) {
      widgetMsg.message = loc(
        key,
        'login',
        undefined,
        {
          $1: { element: 'a', attributes: { href: links[0].url, target: '_blank', rel: 'noopener noreferrer' } },
        },
      );
    } else if (links && links[0] && links[0].url) {
      // each link is inside an individual message
      // We find the last message which contains the option title key and insert the link into that message
      const lastIndex = resultMessageArray.length - 1;
      if (lastIndex < 0) {
        return;
      }
      const linkObject: WidgetMessageLink = {
        url: links[0].url,
        label: message,
      };
      if (resultMessageArray[lastIndex].links) {
        resultMessageArray[lastIndex].links?.push(linkObject);
      } else {
        resultMessageArray[lastIndex].links = [linkObject];
      }
      return;
    } else {
      widgetMsg.message = loc(key, 'login');
    }

    resultMessageArray.push(widgetMsg);
  });

  return {
    type: 'InfoBox',
    options: {
      message: resultMessageArray,
      class: 'ERROR',
      dataSe: 'callout',
    },
  } as InfoboxElement;
};

export const shouldHideIdentifier = (
  showIdentifier?: boolean,
  identifier?: string,
  stepName?: string,
): boolean => {
  const excludedSteps = [IDX_STEP.IDENTIFY, IDX_STEP.CONSENT_ADMIN];
  // Should not display identifier here because if invalid identifier
  // is used, introspect includes the invalid name in user context
  if (typeof stepName !== 'undefined' && excludedSteps.includes(stepName)) {
    return true;
  }

  if (showIdentifier === false) {
    return true;
  }

  if (!identifier) {
    return true;
  }

  return false;
};

const getPhoneVerificationSubtitleTextContent = (
  step: PhoneVerificationStep,
  primaryMethod: PhoneVerificationMethodType,
  phoneNumber?: string,
  nickname?: string,
): string => {
  if (![
    IDX_STEP.CHALLENGE_AUTHENTICATOR,
    IDX_STEP.AUTHENTICATOR_VERIFICATION_DATA,
  ].includes(step)
    || !['sms', 'voice'].includes(primaryMethod)) {
    // If step or method is invalid, return.
    return '';
  }
  type PhoneVerificationI18nCondition = 'withPhoneWithNickName'
  | 'withPhoneWithoutNickName'
  | 'withoutPhone';
  type I18nMapType = Record<
  PhoneVerificationStep,
  Record<PhoneVerificationMethodType, Record<PhoneVerificationI18nCondition, string>>
  >;
  const i18nMap: I18nMapType = {
    [IDX_STEP.CHALLENGE_AUTHENTICATOR]: {
      sms: {
        withPhoneWithNickName: 'oie.phone.verify.sms.codeSentText.with.phone.with.nickname',
        withPhoneWithoutNickName: 'oie.phone.verify.sms.codeSentText.with.phone.without.nickname',
        withoutPhone: 'oie.phone.verify.sms.codeSentText.without.phone',
      },
      voice: {
        withPhoneWithNickName: 'oie.phone.verify.mfa.calling.with.phone.with.nickname',
        withPhoneWithoutNickName: 'oie.phone.verify.mfa.calling.with.phone.without.nickname',
        withoutPhone: 'oie.phone.verify.mfa.calling.without.phone',
      },
    },
    [IDX_STEP.AUTHENTICATOR_VERIFICATION_DATA]: {
      sms: {
        withPhoneWithNickName: 'oie.phone.verify.sms.sendText.with.phone.with.nickname',
        withPhoneWithoutNickName: 'oie.phone.verify.sms.sendText.with.phone.without.nickname',
        withoutPhone: 'oie.phone.verify.sms.sendText.without.phone',
      },
      voice: {
        withPhoneWithNickName: 'oie.phone.verify.call.sendText.with.phone.with.nickname',
        withPhoneWithoutNickName: 'oie.phone.verify.call.sendText.with.phone.without.nickname',
        withoutPhone: 'oie.phone.verify.call.sendText.without.phone',
      },
    },
  };
  if (typeof phoneNumber !== 'undefined') {
    // using the &lrm; unicode mark to keep the phone number in ltr format
    // https://www.w3.org/TR/WCAG20-TECHS/H34.html
    const phoneNumberWithUnicode = `&lrm;${phoneNumber}`;
    return typeof nickname !== 'undefined'
      ? loc(
        i18nMap[step][primaryMethod].withPhoneWithNickName,
        'login',
        [phoneNumberWithUnicode, nickname],
        {
          $1: { element: 'span', attributes: { class: 'strong no-translate' } },
          $2: {
            element: 'span',
            attributes: { class: 'strong no-translate authenticator-verify-nickname' },
          },
        },
      )
      : loc(
        i18nMap[step][primaryMethod].withPhoneWithoutNickName,
        'login',
        [phoneNumberWithUnicode],
        { $1: { element: 'span', attributes: { class: 'strong no-translate' } } },
      );
  }
  return loc(i18nMap[step][primaryMethod].withoutPhone, 'login');
};

export const buildPhoneVerificationSubtitleElement = (
  step: PhoneVerificationStep,
  primaryMethod: PhoneVerificationMethodType,
  idxAuthenticator?: IdxAuthenticator,
): DescriptionElement => {
  const phoneNumber = typeof idxAuthenticator?.profile?.phoneNumber !== 'undefined'
    ? idxAuthenticator?.profile?.phoneNumber as string
    : undefined;
  // @ts-expect-error OKTA-661650 nickname missing from IdxAuthenticator type
  const nickname = typeof idxAuthenticator?.nickname !== 'undefined'
    // @ts-expect-error OKTA-661650 nickname missing from IdxAuthenticator type
    ? idxAuthenticator?.nickname as string
    : undefined;
  const subtitleElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    noMargin: true,
    options: {
      content: getPhoneVerificationSubtitleTextContent(step, primaryMethod, phoneNumber, nickname),
    },
  };

  return subtitleElement;
};

export const eventToValue = (
  ev: any,
): any => (ev.target.value === '' ? undefined : ev.target.value);

export const toFlexJustifyContent = (alignment: LayoutAlignment): string => {
  switch (alignment) {
    case LayoutAlignment.LEADING:
      return 'flex-start';
    case LayoutAlignment.TRAILING:
      return 'flex-end';
    case LayoutAlignment.CENTER:
      return 'center';
    default:
      return 'flex-start';
  }
};

export const toFlexAlignItems = (alignment: LayoutAlignment): string => {
  switch (alignment) {
    case LayoutAlignment.CENTER:
      return 'center';
    case LayoutAlignment.TOP:
      return 'flex-start';
    case LayoutAlignment.BOTTOM:
      return 'flex-end';
    default:
      return 'flex-start';
  }
};
