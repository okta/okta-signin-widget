import { Collection, _, loc, createButton, $ } from 'okta';
import AuthenticatorEnrollOptions from '../components/AuthenticatorEnrollOptions';
import AuthenticatorVerifyOptions from '../components/AuthenticatorVerifyOptions';
import { getAuthenticatorDataForEnroll, getAuthenticatorDataForVerification} from '../utils/AuthenticatorUtil';
import { AUTHENTICATOR_KEY, FORMS as RemediationForms } from '../../ion/RemediationConstants';
import IDP from '../../../util/IDP';
import Util from '../../../util/Util';

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

const inputCreationStrategy = {
  authenticatorEnrollSelect: createAuthenticatorEnrollSelectView,
  authenticatorVerifySelect: createAuthenticatorVerifySelectView
};

// TODO: move logic to uiSchemaTransformer
const create = function (uiSchemaObj) {
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
      className: customButton.className  + ' default-custom-button',
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

const createPIVButtons = (remediations) => {
  const redirectIdpRemediations = remediations.filter(idp => idp.name === 'mtls_idp');

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
      //href: idpObject.href,
      click: () => {
        settings1 = this.settings;
        settings2 = window.settings;
        const promise = new Promise (() => {
          // Make a network request
          pivCallback(remediations);
        });

        promise.then(res => {
          console.log('done');
        }).catch(err => {
          console.log('done with error');
        });
      },
    };
    return button;
  });
};

async function pivCallback(remediations) {
  Util.debugMessage('pivCallback() called');
  const self = this;
  //const pivConfig = this.settings.get('piv');
  const data = {
    fromURI: 'https://naopiv.okta1.com',
    isCustomDomain: false,
  };

  try {
    const url = 'https://naopiv.mtls.okta1.com/api/internal/v1/authn/cert';
    //const urlChallengeAnser = 'https://naopiv.okta1.com/idp/idx/identify';
    const resFromGet = await getCert(url);
    const res = await postCert(url, data);
    const res2 = await postChallengeAnswer('https://naopiv.okta1.com/idp/idx/identify', res.jws);
  } catch (err) {
    if (_.isEmpty(err.responseJSON) && !err.responseText) {
      err.responseJSON = {
        errorSummary: loc('piv.cac.error', 'login'),
      };
    }
    //self.trigger('error', self, err);
  }
};

const getCert = (certAuthUrl) => {
  return $.get({
    url: certAuthUrl,
    xhrFields: {
      withCredentials: true,
    },
    beforeSend: function () {
      // overriding this function to prevent our jquery-wrapper from
      // setting headers. Need to keep this a simple request in order for
      // PIV / CAC to work in IE.
    },
  });
};

// Send POST to the MTLS endpoint
const postCert = (certAuthUrl, data) => {
  return $.post({
    url: certAuthUrl,
    xhrFields: {
      withCredentials: true,
    },
    data: JSON.stringify(data),
    contentType: 'text/plain',
    beforeSend: function () {
      // overriding this function to prevent our jquery-wrapper from
      // setting headers. Need to keep this a simple request in order for
      // PIV / CAC to work in IE.
    },
  });
};

// Send POST to pipeline to finish login process
/*
{
	"stateHandle" : "{{stateHandle}}",
	"identifier" : "{{currentUserIdentifier}}"
}
 */
const postChallengeAnswer = (url, jws) => {
  var stateToken = window.settings.local.stateToken;
  const dataAnswer = {
    stateHandle: stateToken,
    identifier: '32011152472674@upn.example.com'
  };
  return $.post({
    url: url,
    xhrFields: {
      withCredentials: true,
    },
    data: JSON.stringify(dataAnswer),
    //contentType: 'text/plain',
    contentType:'application/ion+json; okta-version=1.0.0',
    accepts:'application/ion+json; okta-version=1.0.0',
    beforeSend: function () {
      // overriding this function to prevent our jquery-wrapper from
      // setting headers. Need to keep this a simple request in order for
      // PIV / CAC to work in IE.
    }
  });
};

module.exports = {
  create,
  createIdpButtons,
  createCustomButtons,
  addCustomButton,
  createPIVButtons,
};
