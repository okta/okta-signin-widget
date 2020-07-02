import BaseFooter from '../internals/BaseFooter';
import { goBackLink } from '../utils/LinksUtil';

export default BaseFooter.extend({
  links () {
    return goBackLink(this.options.appState);
  }
});
