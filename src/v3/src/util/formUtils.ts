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

import { IdxRemediation, IdxTransaction, NextStep } from '@okta/okta-auth-js';
import { FunctionComponent } from 'preact';

import IDP from '../../../util/IDP';
import Util from '../../../util/Util';
import { IDX_STEP } from '../constants';
import SmartCardIconSvg from '../img/smartCardButtonIcon.svg';
import appleIconSvg from '../img/socialButtonIcons/apple.svg';
import facebookIconSvg from '../img/socialButtonIcons/facebook.svg';
import googleIconSvg from '../img/socialButtonIcons/google.svg';
import linkedinIconSvg from '../img/socialButtonIcons/linkedin.svg';
import msIconSvg from '../img/socialButtonIcons/ms.svg';
import oktaIconSvg from '../img/socialButtonIcons/okta.svg';
import {
  ButtonElement, ButtonType, IWidgetContext, LaunchAuthenticatorButtonElement, WidgetProps,
} from '../types';
import { loc } from './locUtil';

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
  const { context, nextStep, neededToProceed: remediations } = transaction;
  const isIdentifyStep = nextStep?.name === IDX_STEP.IDENTIFY;
  const containsLaunchAuthenticator = remediations.some(
    (remediation) => remediation.name === IDX_STEP.LAUNCH_AUTHENTICATOR,
  );

  // only include fastpass button in identify flow
  if (!isIdentifyStep || !containsLaunchAuthenticator) {
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

// TO DO: OKTA-609477 - Add rest of supported social idp icons here
const getIdpButtonIcon = (idpType: string) : string => {
  const idpIconMapping: Record<string, string> = {
    facebook: facebookIconSvg,
    google: googleIconSvg,
    linkedin: linkedinIconSvg,
    microsoft: msIconSvg,
    apple: appleIconSvg,
    okta: oktaIconSvg,
  };
  return idpIconMapping[idpType];
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

    if (IDP.SUPPORTED_SOCIAL_IDPS.includes(type) === false) {
      type = 'general-idp';
      // OKTA-396684 - makes sure that custom idps always have a name
      displayName = loc('customauth.sign.in.with.label', 'login', [idpObject.idp?.name]);
    } else {
      displayName = loc(`socialauth.${type}.label`, 'login');
    }

    const classNames = [
      'social-auth-button',
      `social-auth-${type}-button`,
    ];

    if (type === 'general-idp') {
      classNames.push('no-translate');
    }

    // @ts-expect-error OKTA-609464 - className missing from IdpConfig type
    if (idpObject.idp?.className) {
      // @ts-expect-error OKTA-609464 - className missing from IdpConfig type
      classNames.push(idpObject.idp.className);
    }

    return {
      type: 'Button',
      label: displayName,
      options: {
        type: ButtonType.BUTTON,
        step: IDX_STEP.PIV_IDP,
        dataSe: 'piv-card-button',
        classes: classNames.join(' '),
        variant: 'secondary',
        Icon: getIdpButtonIcon(type),
        iconAlt: loc('piv.card', 'login'),
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
