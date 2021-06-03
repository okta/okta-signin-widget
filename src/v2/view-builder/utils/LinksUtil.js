import { loc, _ } from 'okta';
import { ACTIONS, FORMS as RemediationForms } from '../../ion/RemediationConstants';

const { ENROLLED_PASSWORD_RECOVERY_LINK, ORG_PASSWORD_RECOVERY_LINK } = ACTIONS;

const getSwitchAuthenticatorLink = (appState) => {
  if (appState.getRemediationAuthenticationOptions(RemediationForms.SELECT_AUTHENTICATOR_AUTHENTICATE).length > 1) {
    return [
      {
        'type': 'link',
        'label': loc('oie.verification.switch.authenticator', 'login'),
        'name': 'switchAuthenticator',
        'formName': RemediationForms.SELECT_AUTHENTICATOR_AUTHENTICATE,
      }
    ];
  }

  if (appState.getRemediationAuthenticationOptions(RemediationForms.SELECT_AUTHENTICATOR_ENROLL).length > 1) {
    return [
      {
        'type': 'link',
        'label': loc('oie.enroll.switch.authenticator', 'login'),
        'name': 'switchAuthenticator',
        'formName': RemediationForms.SELECT_AUTHENTICATOR_ENROLL,
      }
    ];
  }

  return [];
};

const getForgotPasswordLink = (appState, settings) => {
  const forgotPasswordLink = {
    'type': 'link',
    'label': loc('forgotpassword', 'login'),
    'name': 'forgot-password',
  };

  const customForgotPasswordHref = settings.get('helpLinks.forgotPassword');

  if (customForgotPasswordHref) {
    return [
      Object.assign({}, {
        'href': customForgotPasswordHref,
        'label': loc('forgotpassword', 'login'),
        'name': 'forgot-password',
      }),
    ];
  }

  // at identify page when only Org Authenticator Password may be available
  else if (appState.getActionByPath(ORG_PASSWORD_RECOVERY_LINK)) {
    return [
      Object.assign({}, forgotPasswordLink, { actionPath: ORG_PASSWORD_RECOVERY_LINK })
    ];
  }

  // at password verify page
  else if (appState.getActionByPath(ENROLLED_PASSWORD_RECOVERY_LINK)) {
    return [
      Object.assign({}, forgotPasswordLink, { actionPath: ENROLLED_PASSWORD_RECOVERY_LINK })
    ];
  }

  return [];
};

const goBackLink = (appState) => {
  if (appState.hasRemediationObject(RemediationForms.SELECT_AUTHENTICATOR_ENROLL)) {
    return [
      {
        'type': 'link',
        'label': loc('oie.go.back', 'login'),
        'name': 'go-back',
        'formName': RemediationForms.SELECT_AUTHENTICATOR_ENROLL,
      }
    ];
  }

  return [];
};

const getSkipSetupLink = (appState) => {
  if (appState.hasRemediationObject(RemediationForms.SKIP)) {
    return [
      {
        'type': 'link',
        'label': loc('oie.enroll.skip.setup', 'login'),
        'name': 'skip-setup',
        'actionPath': RemediationForms.SKIP,
      }
    ];
  }

  return [];
};

const getSignOutLink = (settings, options = {}) => {
  if (settings?.get('signOutLink')) {
    return [
      {
        'label': loc('signout', 'login'),
        'name': 'cancel',
        'href': settings.get('signOutLink')
      },
    ];
  } else {
    return [
      {
        'actionPath': 'cancel',
        'label': !options.label ? loc('backToSignin', 'login') : options.label,
        'name': 'cancel',
        'type': 'link'
      },
    ];
  }
};

const getBackToSignInLink = (settings) => {
  return [
    {
      'type': 'link',
      'label': loc('backToSignin', 'login'),
      'name': 'go-back',
      // TODO: OKTA-381328 back to baseUrl only works for default login page
      'href': settings?.get('baseUrl'),
    },
  ];
};

const getReloadPageButtonLink = () => {
  return [
    {
      'type': 'link',
      'label': loc('oie.try.again', 'login'),
      'name': 'try-again',
      'href': window.location,
      'className': 'button button-primary text-align-c'
    },
  ];
};

const getSignUpLink = (appState, settings) => {
  const signupLink = [];

  if (appState.hasRemediationObject(RemediationForms.SELECT_ENROLL_PROFILE)) {
    const signupLinkData = {
      'type': 'link',
      'label': loc('oie.registration.form.title', 'login'),
      'name': 'enroll'
    };
    if (_.isFunction(settings.get('registration.click'))) {
      signupLinkData.clickHandler = settings.get('registration.click');
    } else {
      signupLinkData.actionPath = RemediationForms.SELECT_ENROLL_PROFILE;
    }
    signupLink.push(signupLinkData);
  }

  return signupLink;
};

export {
  getSwitchAuthenticatorLink,
  getForgotPasswordLink,
  goBackLink,
  getSignUpLink,
  getSignOutLink,
  getBackToSignInLink,
  getSkipSetupLink,
  getReloadPageButtonLink
};
