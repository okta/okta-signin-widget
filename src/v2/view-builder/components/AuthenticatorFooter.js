import { BaseFooter } from '../internals';
import { getSwitchAuthenticatorLink } from '../utils/LinksUtil';

export default BaseFooter.extend({
  links() {
    return getSwitchAuthenticatorLink(this.options.appState);
  }
});
