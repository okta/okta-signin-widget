import IdentifierView from './IdentifierView';
import IdentifierFooter from '../components/IdentifierFooter';
import { getBackToSignInLink } from '../utils/LinksUtil';


export default IdentifierView.extend({

  initialize() {
    IdentifierView.prototype.initialize.apply(this, arguments);

    this.Footer = IdentifierFooter.extend({
      // We don't show the forgot password link if rendering idps
      showForgotPasswordLink: () => false,
      links() {
        // We take the base set of links from the parent and add the 'Back to Sign In' link to it.
        const baseLinks = IdentifierFooter.prototype.links.call(this);
        return baseLinks.concat(getBackToSignInLink(this.options.settings));
      }
    });
  },

  render() {
    IdentifierView.prototype.render.apply(this, arguments);

    this.$el.find('.sign-in-with-idp .separation-line').hide();
    this.$el.find('.button-primary').hide();
  }
});
