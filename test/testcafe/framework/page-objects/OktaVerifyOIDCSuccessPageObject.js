import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class TerminalPageObject extends BasePageObject {
  hasOktaVerifyIconAsBeacon() {
    const header = new Selector('.siw-main-header');
    return header.find('.auth-beacon.mfa-okta-verify').exists;
  }
}
