import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';
import email from '../../shared/email';

const Body = BaseForm.extend(Object.assign(
  {
    save: 'Send Email Link',
  },
  email,
));

const Footer = BaseFooter.extend({
  links: function () {
    var links = [];
    // if there are 2 forms, the second form is the switch factor form
    if (this.options.appState.hasRemediationForm('switch-factor')) {
      links.push({
        'type': 'link',
        'label': 'Switch Factor',
        'name': 'switchFactor',
        'actionPath': 'switch-factor',
      });
    }
    return links;
  }
});

export default BaseView.extend({
  Body,
  Footer
});
