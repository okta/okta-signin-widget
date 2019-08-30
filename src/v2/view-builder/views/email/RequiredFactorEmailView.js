import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';
import email from '../shared/email';
import BaseFactorView from '../shared/BaseFactorView';

const Body = BaseForm.extend(Object.assign(
  {
    save: 'Send Email Link',
  },
  email,
));

const Footer = BaseFooter.extend({
  links: function () {
    var links = [];
    // check if we have a select-factor form in remediation, if so add a link
    if (this.options.appState.hasRemediationForm('select-factor')) {
      links.push({
        'type': 'link',
        'label': 'Switch Factor',
        'name': 'switchFactor',
        'formName': 'select-factor',
      });
    }
    return links;
  }
});

export default BaseFactorView.extend({
  Body,
  Footer
});
