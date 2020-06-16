import { loc } from 'okta';

const addSwitchAuthenticatorLink = (appState, links = []) => {
  if (appState.hasRemediationObject('select-factor-authenticate')) {
    links.push({
      'type': 'link',
      'label':  loc('mfa.switch', 'login'),
      'name': 'switchFactor',
      'formName': 'select-factor-authenticate',
    });
  }

  if (appState.hasRemediationObject('select-authenticator-authenticate')) {
    links.push({
      'type': 'link',
      'label':  loc('oie.switch.authenticator', 'login'),
      'name': 'switchAuthenticator',
      'formName': 'select-authenticator-authenticate',
    });
  }

};


export {
  addSwitchAuthenticatorLink
};