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

import fetch from 'cross-fetch';
import {
  IdxAuthenticator,
  IdxMessage, IdxRemediation, IdxTransaction, NextStep,
} from '@okta/okta-auth-js';

import { LanguageCode } from '../../../types';
import IDP from '../../../util/IDP';
import Logger from '../../../util/Logger';
import TimeUtil from '../../../util/TimeUtil';
import Util from '../../../util/Util';
import {
  CUSTOM_APP_UV_ENABLE_BIOMETRIC_SERVER_KEY, IDX_STEP, SOCIAL_IDP_TYPE_TO_I18KEY, TERMINAL_KEY,
} from '../constants';
import SmartCardIconSvg from '../img/smartCardButtonIcon.svg';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  DeviceRemediation,
  IWidgetContext,
  LaunchAuthenticatorButtonElement,
  PhoneVerificationMethodType,
  WidgetMessage,
  WidgetMessageLink,
  WidgetProps,
} from '../types';
import { idpIconMap } from './idpIconMap';
import { loc } from './locUtil';

const ADP_INSTALL_FALLBACK_REMEDIATION_KEY = 'idx.error.code.access_denied.device_assurance.remediation.android.zero.trust.android_device_policy_app_required_manual_install';

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
        dataSe: customButton.dataAttr ?? 'custom-button',
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
      dataSe: `piv-card-button${piv?.className ? ` ${piv.className}` : ''}`,
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
      noTranslate: type === 'general-idp',
      options: {
        type: ButtonType.BUTTON,
        step: IDX_STEP.PIV_IDP,
        // @ts-expect-error OKTA-609464 - className missing from IdpConfig type
        dataSe: `piv-card-button ${idpObject.idp?.className || `social-auth-${type}-button`}`,
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

const buildEnduserRemediationWidgetMessageLink = (
  links: WidgetMessageLink[],
  deviceRemediation: DeviceRemediation,
  message: string): WidgetMessageLink | undefined  => {
  if (links?.[0]?.url) {
    return {
      url: links[0].url,
      label: message,
    };
  } else if (deviceRemediation.action) {
    return {
      label: message,
      onClick: () => {
        console.log('clicked the device remediation link button, triggering loopback...');
        probeLoopbackAndExecute(deviceRemediation);
      },
      dataSe: deviceRemediation.action,
    };
  }
  // this should not happen since we assert at least one of links/deviceRemediation will be set
  return undefined;
};

export const buildEndUserRemediationMessages = (
  messages: IdxMessage[],
  languageCode?: LanguageCode,
) : WidgetMessage[] | undefined => {
  if (messages.length === 0) {
    return undefined;
  }

  const ACCESS_DENIED_I18N_KEY_PREFIX = TERMINAL_KEY.END_USER_REMEDIATION_ERROR_PREFIX;
  const GRACE_PERIOD_I18N_KEY_PREFIX = 'idx.device_assurance.grace_period.warning';
  const HELP_AND_CONTACT_KEY_PREFIX = `${ACCESS_DENIED_I18N_KEY_PREFIX}.additional_help_`;
  const REMEDIATION_OPTION_INDEX_KEY = `${ACCESS_DENIED_I18N_KEY_PREFIX}.option_index`;
  const ACCESS_DENIED_TITLE_KEY = `${ACCESS_DENIED_I18N_KEY_PREFIX}.title`;
  const GRACE_PERIOD_TITLE_KEY = `${GRACE_PERIOD_I18N_KEY_PREFIX}.title`;
  const resultMessageArray: WidgetMessage[] = [];

  messages.forEach((msg) => {
    const {
      i18n: { key, params = [] },
      // @ts-expect-error OKTA-630508 links is missing from IdxMessage type
      links,
      // @ts-expect-error deviceRemediation is missing from IdxMessage type
      deviceRemediation,
      message,
    } = msg;

    const widgetMsg = { listStyleType: 'disc' } as WidgetMessage;
    if (key === ACCESS_DENIED_TITLE_KEY || key === REMEDIATION_OPTION_INDEX_KEY) {
      // `messages` will already be localized at this point by transactionMessageTransformer, so we can directly set
      // widgetMsg.title equal to `message`
      widgetMsg.title = message;
    } else if (key.startsWith(GRACE_PERIOD_TITLE_KEY)) {
      // OKTA-798446 TODO: Migrate to i18next datetime localization after it is merged to gen3
      if (params.length > 0) {
        // Should be an ISO8601 format string
        const expiry = params[0];
        const expiryDate = new Date(expiry as string);
        const localizedExpiry = TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(
          expiryDate, languageCode,
        );
        widgetMsg.title = localizedExpiry ? loc(key, 'login', [localizedExpiry]) : message;
      }
    } else if (key.startsWith(HELP_AND_CONTACT_KEY_PREFIX)) {
      widgetMsg.message = loc(
        key,
        'login',
        undefined,
        {
          $1: { element: 'a', attributes: { href: links[0].url, target: '_blank', rel: 'noopener noreferrer' } },
        },
      );
    } else if (links?.[0]?.url || deviceRemediation?.value) {
      // each link is inside an individual message
      // We find the last message which contains the option title key and insert the link into that message
      const lastIndex = resultMessageArray.length - 1;
      if (lastIndex < 0) {
        return;
      }
      const linkObject = buildEnduserRemediationWidgetMessageLink(links, deviceRemediation?.value, message);
      if (linkObject === undefined) {
        return;
      }

      if (resultMessageArray[lastIndex].links) {
        resultMessageArray[lastIndex].links?.push(linkObject);
      } else {
        resultMessageArray[lastIndex].links = [linkObject];
      }
      return;
    } else {
      widgetMsg.message = message;
    }

    resultMessageArray.push(widgetMsg);
  });

  return resultMessageArray;
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
          $1: { element: 'span', attributes: { class: 'strong no-translate nowrap' } },
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
        { $1: { element: 'span', attributes: { class: 'strong no-translate nowrap' } } },
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
  const nickname = typeof idxAuthenticator?.nickname !== 'undefined'
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

type RequestOptions = {
  url: string;
  timeout: number;
  method: 'GET' | 'POST';
  data?: string;
};

/**
* Temporary request client can be removed if this functionality is added
* to auth-js library.
* @see https://oktainc.atlassian.net/browse/OKTA-561852
* @returns Promise<Response>
*/
export const makeRequest = async ({
 url, timeout, method, data,
}: RequestOptions) => {
 // Modern browsers support AbortController, so use it
 if (window?.AbortController) {
   const controller = new AbortController();
   const id = setTimeout(() => controller.abort(), timeout);

   const response = await fetch(url, {
     method,
     headers: {
       'Content-Type': 'application/json',
     },
     ...(typeof data === 'string' ? { body: data } : {}),
     signal: controller.signal,
   });

   clearTimeout(id);

   return response;
 }

 // IE11 does not support AbortController, so use an alternate
 // timeout mechanism
 const responsePromise = fetch(url, {
   method,
   headers: {
     'Content-Type': 'application/json',
   },
   ...(typeof data === 'string' ? { body: data } : {}),
 });
 const timeoutPromise = new Promise<Response>((_, reject) => {
   setTimeout(() => {
     const abortError = new Error('Aborted');
     abortError.name = 'AbortError';
     reject(abortError);
   }, timeout);
 });

 return Promise.race([responsePromise, timeoutPromise]);
};

const getMessage = (fallback: DeviceRemediation['fallback']) => {
  switch (fallback.message?.i18n?.key) {
    case ADP_INSTALL_FALLBACK_REMEDIATION_KEY:
      // ADP fallback message has additional formatting
      return loc(
        fallback.message.i18n.key,
        'login',
        fallback.message.i18n.params,
        { $1: { element: 'span', attributes: { class: 'strong nowrap' } } },
      );
    default:
      return loc(fallback.message!.i18n.key, 'login', fallback.message?.i18n.params);
  }
};

const executeDeviceRemediationFallback = (fallback: DeviceRemediation['fallback'], action: string) => {
  switch (fallback.type) {
    case 'APP_LINK':
      // If/when loopback fails auto launch app link to install
      Util.executeOnVisiblePage(() => {
        Util.redirectWithFormGet(fallback.href);
      });
      break;
    case 'MESSAGE':
      // display updated message in place
      const elements = document.querySelectorAll(`[data-se="${action}"]`);
      if (elements?.[0]) {
        elements[0].outerHTML = getMessage(fallback);
      }
      break;
    default: // Do nothing
  }
};

export const probeLoopbackAndExecute = async (deviceRemediation: DeviceRemediation) => {
  let remediationSucceeded = false;

  const baseUrls = deviceRemediation.ports.map((port) => `${deviceRemediation.domain}:${port}`);

  for (const baseUrl of baseUrls) {
    try {
      // probe the port
      const probeResponse = await makeRequest({
        method: 'GET',
        timeout: deviceRemediation.probeTimeoutMillis,
        url: `${baseUrl}/probe`,
      });

      if (!probeResponse.ok) {
        Logger.error(`Loopback is not listening on: ${baseUrl}.`);
        continue;
      }

      // attempt the remediation request with found port
      const remediationResponse = await makeRequest({
        url: `${baseUrl}/${deviceRemediation.action}`,
        method: 'GET',
        timeout: 300_000,
      });

      if (!remediationResponse.ok) {
        if (remediationResponse.status !== 503) {
          // return immediately
          return;
        }

        // try the next domain:port
        continue;
      }
      // remediation response was a 2xx, end probing
      remediationSucceeded = true;
      break;
    } catch (e) {
      // only for unexpected error conditions (e.g. fetch throws an error)
      Logger.error(`Something unexpected happened while we were checking url ${baseUrl}`);
    }
  }

  if (!remediationSucceeded) {
    // if remediation request was not made after probe, utilize fallback mechanism
    Logger.error('No available ports. Loopback server failed, triggering fallback.');

    executeDeviceRemediationFallback(deviceRemediation.fallback, deviceRemediation.action);
  }
};
