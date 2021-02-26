import { $, _, loc } from 'okta';
import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';
import IdentifierFooter from '../../components/IdentifierFooter';
import SignInWithDeviceOption from '../signin/SignInWithDeviceOption';
import Link from '../../components/Link';

const Body = BaseForm.extend({

  title () {
    return loc('primaryauth.title', 'login');
  },

  noButtonBar: true,

  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.add(
      SignInWithDeviceOption,
      { selector: '.o-form-fieldset-container',
        bubble: false,
        prepend: true,
        options: { isRequired: true }
      }
    );
  },
});

// override the footer to add all the supported links except the sign out link
// no session is granted at this point
const Footer = IdentifierFooter.extend({
  initialize () {
    let links = _.resultCtx(this, 'links', this);
    if (!Array.isArray(links)) {
      links = [];
    } else {
      links = links.filter(l => $.isPlainObject(l));
    }

    links.forEach(link => {
      this.add(Link, {
        options: link,
      });
    });
  }
});

export default BaseView.extend({
  Body,
  Footer,
});
