import { loc } from 'okta';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';

const PASSWORD_RECOVERY_LINK = 'currentAuthenticatorEnrollment-recover';

const getSwitchAuthenticatorLink = (appState) => {
  if (appState.hasRemediationObject('select-factor-authenticate')) {
    return [
      {
        'type': 'link',
        'label':  loc('mfa.switch', 'login'),
        'name': 'switchFactor',
        'formName': 'select-factor-authenticate',
      }
    ];
  }

  if (appState.hasRemediationObject(RemediationForms.SELECT_AUTHENTICATOR_AUTHENTICATE)) {
    return [
      {
        'type': 'link',
        'label':  loc('oie.switch.authenticator', 'login'),
        'name': 'switchAuthenticator',
        'formName': RemediationForms.SELECT_AUTHENTICATOR_AUTHENTICATE,
      }
    ];
  }
};

const getForgotPasswordLink = (appState) => {
  const forgotPasswordLink = {
    'type': 'link',
    'label': loc('oie.password.forgot.title', 'login'),
    'name': 'forgot-password',
  };
  if (appState.getActionByPath(PASSWORD_RECOVERY_LINK)) {
    return [
      Object.assign({}, forgotPasswordLink, { actionPath: PASSWORD_RECOVERY_LINK }),
    ];
  } else {
    return [];
  }
};

export {
  getSwitchAuthenticatorLink,
  getForgotPasswordLink,
};
