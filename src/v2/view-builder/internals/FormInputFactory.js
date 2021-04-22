import { Collection, _, loc, createButton } from 'okta';

import AuthenticatorEnrollOptions from '../components/AuthenticatorEnrollOptions';
import AuthenticatorVerifyOptions from '../components/AuthenticatorVerifyOptions';
import { getAuthenticatorDataForEnroll, getAuthenticatorDataForVerification } from '../utils/AuthenticatorUtil';
import { AUTHENTICATOR_KEY, FORMS as RemediationForms } from '../../ion/RemediationConstants';
import IDP from '../../../util/IDP';
import AdminScopeList from '../../../views/admin-consent/ScopeList';
import EnduserScopeList from '../../../views/consent/ScopeList';
import CaptchaView from '../views/captcha/CaptchaView';


const createAuthenticatorEnrollSelectView = (opt) => {
  var optionItems = (opt.options || [])
    .map(opt => {
      return Object.assign({}, opt, getAuthenticatorDataForEnroll(opt));
    });
  return {
    View: AuthenticatorEnrollOptions,
    options: {
      name: opt.name,
      collection: new Collection(optionItems),
    }
  };
};

const createAuthenticatorVerifySelectView = (opt) => {
  let optionItems = (opt.options || []);
  // If webauthn enrollments > 1 just show one entry with a generic namne (first) so user doesnt have to select which
  // one to pick. eg) If there is yubikey5 and another unknown u2f key, user cannot identify that easily. We need to
  // do this at least  until users can give authenticator enrollments custom names.
  let hasSecurityKey = false;
  optionItems = optionItems.filter(opt => {
    if (opt.authenticatorKey === AUTHENTICATOR_KEY.WEBAUTHN) {
      if (!hasSecurityKey) {
        hasSecurityKey = true;
        return true;
      } else {
        return false;
      }
    }
    return true;
  });
  optionItems = optionItems.map(opt => {
    return Object.assign({}, opt, getAuthenticatorDataForVerification(opt));
  });
  return {
    View: AuthenticatorVerifyOptions,
    options: {
      name: opt.name,
      collection: new Collection(optionItems),
    }
  };
};

const createAdminScopesView = () => {
  return {
    View: AdminScopeList,
  };
};
const createEnduserScopesView = () => {
  return {
    View: EnduserScopeList,
  };
};

const createCaptchaView = (opt) => {
  return {
    View: CaptchaView,
    options: {
      name: opt.name,
    }    
  };
};

const inputCreationStrategy = {
  authenticatorEnrollSelect: createAuthenticatorEnrollSelectView,
  authenticatorVerifySelect: createAuthenticatorVerifySelectView,
  ['admin-consent']: createAdminScopesView,
  ['consent']: createEnduserScopesView,
  ['captcha']: createCaptchaView,
};

// TODO: move logic to uiSchemaTransformer
const create = function(uiSchemaObj) {
  const strategyFn = inputCreationStrategy[uiSchemaObj.type] || _.identity;
  return strategyFn(uiSchemaObj);
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
const createIdpButtons = (remediations) => {
  const redirectIdpRemediations = remediations.filter(idp => idp.name === RemediationForms.REDIRECT_IDP);

  if (!Array.isArray(redirectIdpRemediations)) {
    return [];
  }

  //add buttons from idp object
  return redirectIdpRemediations.map(idpObject => {
    let type = idpObject.type?.toLowerCase();
    let displayName;

    if (!_.contains(IDP.SUPPORTED_SOCIAL_IDPS, type)) {
      type = 'general-idp';
      displayName = idpObject.idp?.name || '{ Please provide a text value }';
    } else {
      displayName = loc(`socialauth.${type}.label`, 'login');
    }

    let classNames = [
      'social-auth-button',
      `social-auth-${type}-button`,
    ];

    if (idpObject.idp.className) {
      classNames.push(idpObject.idp.className);
    }

    const button = {
      attributes: {
        'data-se': `social-auth-${type}-button`,
      },
      className: classNames.join(' '),
      title: displayName,
      href: idpObject.href,
    };
    return button;
  });
};

const createCustomButtons = (settings) => {
  const customButtons = settings.get('customButtons');
  return customButtons.map(customButton => {
    const button = {
      attributes: {
        'data-se': customButton.dataAttr
      },
      className: customButton.className + ' default-custom-button',
      title: customButton.title,
      click: customButton.click
    };
    return button;
  });
};

const addCustomButton = (customButtonSettings) => {
  return createButton({
    ...customButtonSettings,
    className: `${customButtonSettings.className} default-custom-button button-primary`,
  });
};

module.exports = {
  create,
  createIdpButtons,
  createCustomButtons,
  addCustomButton,
};
