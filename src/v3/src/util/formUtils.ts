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
import classNames from 'classnames';

import IDP from '../../../util/IDP';
import Util from '../../../util/Util';
import { IDX_STEP, SOCIAL_IDP_TYPE_TO_I18KEY } from '../constants';
import SmartCardIconSvg from '../img/smartCardButtonIcon.svg';
import {
  ButtonElement,
  ButtonType,
  IWidgetContext,
  LaunchAuthenticatorButtonElement,
  WidgetProps,
} from '../types';
import { idpButtonIconMap } from './idpButtonIconMap';
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
        Icon: idpButtonIconMap[type],
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
