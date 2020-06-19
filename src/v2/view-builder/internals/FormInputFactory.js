import { Collection, _, loc } from 'okta';
import FactorOptions from '../components/FactorOptions';
import AuthenticatorEnrollOptions from '../components/AuthenticatorEnrollOptions';
import AuthenticatorVerifyOptions from '../components/AuthenticatorVerifyOptions';
import FactorUtil from '../utils/FactorUtil';
import RemediationEnum from '../../ion/RemediationEnum';
import IDP from '../../../util/IDP';

const createFactorSelectView = (opt) => {
  var optionItems = (opt.options || [])
    .map(opt => {
      return Object.assign({}, FactorUtil.getFactorData(opt.factorType), opt);
    });
  return {
    View: FactorOptions,
    options: {
      name: opt.name,
      collection: new Collection(optionItems),
    }
  };
};

const createAuthenticatorEnrollSelectView = (opt) => {
  var optionItems = (opt.options || [])
    .map(opt => {
      return Object.assign({}, opt, FactorUtil.getFactorData(opt.authenticatorType));
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
    if (opt.authenticatorType === 'security_key') {
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
    return Object.assign({}, opt, FactorUtil.getFactorData(opt.authenticatorType));
  });
  return {
    View: AuthenticatorVerifyOptions,
    options: {
      name: opt.name,
      collection: new Collection(optionItems),
    }
  };
};

const inputCreationStrategy = {
  factorSelect: createFactorSelectView,
  authenticatorEnrollSelect: createAuthenticatorEnrollSelectView,
  authenticatorVerifySelect: createAuthenticatorVerifySelectView
};

// TODO: move logic to uiSchemaTransformer
const create = function (uiSchemaObj) {
  const strategyFn = inputCreationStrategy[uiSchemaObj.type] || _.identity;
  return strategyFn(uiSchemaObj);
};

const createIdpButtons = (remediations) => {
  const redirectObjets = remediations.filter(idp => idp.name === RemediationEnum.FORMS.REDIRECT_IDP);

  if (!Array.isArray(redirectObjets)) {
    return [];
  }

  //add buttons from idp object
  return redirectObjets.map(idpObject => {
    let type = idpObject.type && idpObject.type.toLowerCase();
    let displayName;

    if (!_.contains(IDP.SUPPORTED_SOCIAL_IDPS, type)) {
      type = 'general-idp';
      displayName = idpObject.idp && idpObject.idp.name || '{ Please provide a text value }';
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

module.exports = {
  create,
  createIdpButtons,
};
