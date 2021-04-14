/*!
 * Copyright (c) 2020, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { _ } from 'okta';
import { FORMS as RemediationForms } from './RemediationConstants';

/**
 * Transform the ion spec response into canonical format.
 */

/**
 * Authn V2 response
 * @typedef {Object} AuthnResponse
 */

/**
 * @typedef {Object} AuthnResult
 * @property {Object=} user
 * @property {Object=} authenticator
 */

const isObject = x => _.isObject(x);

/**
 * Flatten first level objects from response
 */
const getFirstLevelObjects = (resp) => {
  const result = {};
  _.each(resp, (val, key) => {
    // if key is remediation we dont do any transformation
    if (key === 'remediation') {
      return;
    }

    // for arrays we just want it as a top level object
    // Example authenticators array in select-authenticator form
    if (val.type === 'array') {
      result[key] = {
        value: val.value,
      };
    }

    // for handling attributes with type object
    if (val.type === 'object') {
      result[key] = val.value;
    }

    // for handling CAPTCHA
    if (key === 'captcha') {
      result[key] = val;
    }
  });
  return result;
};

const getRemediationValues = (idx) => {
  const remediationValues = [];
  const hasSkipRemediationOnly =
    idx.neededToProceed.length === 1 && idx.neededToProceed[0].name === 'skip';
  if (_.isEmpty(idx.neededToProceed) || hasSkipRemediationOnly) {
    // no remediation or only skip remediation with success
    if (idx.context.success) {
      remediationValues.push({
        name: idx.context.success.name,
        href: idx.context.success.href,
        value: [],
      });
    } else if (idx.context.messages) {
      // no remediation or only skip remediation with messages
      remediationValues.push({
        name: RemediationForms.TERMINAL,
        // Using `value` is unnecessary as `messages` will be display via `TerminalView.showMessages`,
        // even though might sound a little counterintuitive.
        // The reason being is there is `BaseForm.showMessages` that is intended to handle
        // messages generically.
        value: [],
      });
    } else if (idx.context.deviceEnrollment) {
      // no remediation or only skip remediation with messages for device enrollment state
      // and the state is meant to be terminal state with different UI than the regular terminal view
      remediationValues.push({
        name: RemediationForms.DEVICE_ENROLLMENT_TERMINAL,
        value: [],
      });
    }

  }
  return {
    remediations: [
      ...remediationValues,
      ...idx.neededToProceed,
    ]
  };
};

/**
 * To support `idps` configuration in OIE.
 * https://github.com/okta/okta-signin-widget#openid-connect
 */
const injectIdPConfigButtonToRemediation = (settings, idxResp) => {
  const widgetRemedations = idxResp.remediations;
  const hasIdentifyRemedation = widgetRemedations.filter(r => r.name === 'identify');
  if (hasIdentifyRemedation.length === 0) {
    return idxResp;
  }

  const idpsConfig = settings.get('idps');
  if (Array.isArray(idpsConfig)) {
    const existsRedirectIdpIds = {};
    widgetRemedations.forEach(r => {
      if (r.name === RemediationForms.REDIRECT_IDP && r.idp) {
        existsRedirectIdpIds[r.idp.id] = true;
      }
    });
    const baseUrl = settings.get('baseUrl');
    const stateHandle = idxResp.idx.context.stateHandle;
    const redirectIdpRemedations = idpsConfig
      .filter(c => !existsRedirectIdpIds[c.id]) // omit idps that are already in remediation.
      .map(idpConfig => {
        const idp = {
          id: idpConfig.id,
          name: idpConfig.text,
        };
        const redirectUri = `${baseUrl}/sso/idps/${idpConfig.id}?stateToken=${stateHandle}`;
        if (idpConfig.className) {
          idp.className = idpConfig.className;
        }
        return {
          name: RemediationForms.REDIRECT_IDP,
          type: idpConfig.type,
          idp,
          href: redirectUri,
        };
      });
    idxResp.remediations = widgetRemedations.concat(redirectIdpRemedations);
  }

  return idxResp;
};

/**
 * IFF there is one `redirect-idp` remediation form, widget will automatically redirect to `redirect-idp.href`.
 *
 * The idea now is to reuse `success-redirect` thus converts `redirect-idp` to `success-redirect` form.
 */
const convertRedirectIdPToSuccessRedirectIffOneIdp = (result) => {
  if (Array.isArray(result.remediations)) {
    const redirectIdpRemediations = result.remediations.filter(idp => idp.name === RemediationForms.REDIRECT_IDP);
    if (redirectIdpRemediations.length === 1 && result.remediations.length === 1) {
      const successRedirect = {
        name: RemediationForms.SUCCESS_REDIRECT,
        href: redirectIdpRemediations[0].href,
        value: [],
      };
      result.remediations = [ successRedirect ];
    }
  }
};

/**
 * @param {Models.Settings} user configuration
 * @param {idx} idx object
 * @returns {} transformed object with flattened firstlevel objects, idx and remediations array
 * Example: {
 *  idx: {
 *    proceed: ƒ(),
 *    neededToProceed: [],
 *    actions: {cancel: ƒ()},
 *    context: {},
 *  },
 *  remediations: [],
 *  authenticators: {},
 *  authenticator: {},
 *  messages: {},
 *  deviceEnrollment: {},
 * }
 */
const convert = (settings, idx = {}) => {
  if (!isObject(idx.rawIdxState)) {
    return null;
  }
  const firstLevelObjects = getFirstLevelObjects(idx.rawIdxState);

  const remediationValues = getRemediationValues(idx);

  const result = Object.assign({},
    firstLevelObjects,
    remediationValues,
    { idx }
  );

  injectIdPConfigButtonToRemediation(settings, result);
  convertRedirectIdPToSuccessRedirectIffOneIdp(result);

  return result;
};

export default convert;
