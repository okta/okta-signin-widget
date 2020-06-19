import { loc } from 'okta';
import RemediationEnum from '../../ion/RemediationEnum';

const addSwitchAuthenticatorLink = (appState, links = []) => {
  if (appState.hasRemediationObject('select-factor-authenticate')) {
    links.push({
      'type': 'link',
      'label':  loc('mfa.switch', 'login'),
      'name': 'switchFactor',
      'formName': 'select-factor-authenticate',
    });
  }

  if (appState.hasRemediationObject(RemediationEnum.FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE)) {
    links.push({
      'type': 'link',
      'label':  loc('oie.switch.authenticator', 'login'),
      'name': 'switchAuthenticator',
      'formName': RemediationEnum.FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE,
    });
  }

};


export {
  addSwitchAuthenticatorLink
};