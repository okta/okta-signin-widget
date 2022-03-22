import { BaseFooter } from '../internals';
import { getFactorPageCustomLink, getSwitchAuthenticatorLink } from '../utils/LinksUtil';

export default BaseFooter.extend({
  links() {
    return getFactorPageCustomLink(this.options.appState, this.options.settings)
      .concat(getSwitchAuthenticatorLink(this.options.appState));
  },
});
