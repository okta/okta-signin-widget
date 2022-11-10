import { loc, _ } from '@okta/courage';
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

  if (appState.getRemediationAuthenticationOptions(RemediationForms.SELECT_AUTHENTICATOR_ENROLL).length >= 1) {
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

const getSkipSetupLink = (appState, linkName) => {
  if (appState.hasRemediationObject(RemediationForms.SKIP)) {
    return [
      {
        'type': 'link',
        'label': linkName ?? loc('oie.enroll.skip.setup', 'login'),
        'name': 'skip-setup',
        'actionPath': RemediationForms.SKIP,
      }
    ];
  }

  return [];
};

// When there is a 'cancel' object in remediation
const getSignOutLink = (settings, options = {}) => {
  if (settings?.get('backToSignInUri')) {
    return [
      {
        'label': loc('goback', 'login'),
        'name': 'cancel',
        'href': settings.get('backToSignInUri')
      },
    ];
  }

  return [
    {
      'actionPath': 'cancel',
      'label': !options.label ? loc('goback', 'login') : options.label,
      'name': 'cancel',
      'type': 'link'
    },
  ];
};

// Use it to create a widget configured link in the absence of `cancel` object in remediation
const getBackToSignInLink = ({settings, appState}) => {
  const link = {};

  // If backToSignInLink is set, use this value for all scenarios
  if (settings?.get('backToSignInUri')) {
    link.href = settings.get('backToSignInUri');
  }
  // fallback for embedded scenarios
  else if (settings?.get('oauth2Enabled')) {
    link.clickHandler = () => {
      appState.trigger('restartLoginFlow');
    };
  }
  // fallback for okta-hosted scenarios (backend should set signOutLink or backToSignOutLink)
  else {
    link.href = settings?.get('baseUrl');
  }

  return [
    {
      'type': 'link',
      'label': loc('goback', 'login'),
      'name': 'go-back',
      ...link
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

const getFactorPageCustomLink = (appState, settings) => {
  const factorPageCustomLink = [];
  const formsNeedFactorPageCustomLink = [
    RemediationForms.CHALLENGE_AUTHENTICATOR,
    RemediationForms.SELECT_AUTHENTICATOR_AUTHENTICATE,
    RemediationForms.CHALLENGE_POLL,
    RemediationForms.AUTHENTICATOR_VERIFICATION_DATA,
  ];

  if (!appState.get('isPasswordRecovery') && formsNeedFactorPageCustomLink.includes(appState.get('currentFormName'))) {
    const helpLinksFactorPageLabel = settings.get('helpLinks.factorPage.text');
    const helpLinksFactorPageHref = settings.get('helpLinks.factorPage.href');

    if (helpLinksFactorPageLabel && helpLinksFactorPageHref) {
      factorPageCustomLink.push({
        type: 'link',
        label: helpLinksFactorPageLabel,
        name: 'factorPageHelpLink',
        href: helpLinksFactorPageHref,
        target: '_blank',
      });
    }
  }
  return factorPageCustomLink;
};

export {
  getSwitchAuthenticatorLink,
  getForgotPasswordLink,
  goBackLink,
  getSignUpLink,
  getSignOutLink,
  getBackToSignInLink,
  getSkipSetupLink,
  getReloadPageButtonLink,
  getFactorPageCustomLink,
};
