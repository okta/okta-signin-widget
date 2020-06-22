import { loc } from 'okta';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';

const addSwitchAuthenticatorLink = (appState, links = []) => {
  if (appState.hasRemediationObject('select-factor-authenticate')) {
    links.push({
      'type': 'link',
      'label':  loc('mfa.switch', 'login'),
      'name': 'switchFactor',
      'formName': 'select-factor-authenticate',
    });
  }

  if (appState.hasRemediationObject(RemediationForms.SELECT_AUTHENTICATOR_AUTHENTICATE)) {
    links.push({
      'type': 'link',
      'label':  loc('oie.switch.authenticator', 'login'),
      'name': 'switchAuthenticator',
      'formName': RemediationForms.SELECT_AUTHENTICATOR_AUTHENTICATE,
    });
  }

};


export {
  addSwitchAuthenticatorLink
};