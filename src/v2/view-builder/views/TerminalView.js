import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import BaseFooter from '../internals/BaseFooter';

const Body = BaseForm.extend({
  title () {
    const msg = this.options.appState.get('terminal').message || {};
    return msg.message || 'You can close this window';
  },
  noButtonBar: true,
});

const Footer = BaseFooter.extend({
  links () {
    return [
      {
        'type': 'link',
        'label': 'Back to sign in',
        'name': 'back',
        'href': '/'
      }
    ];
  }
});

export default BaseView.extend({
  Body,
  Footer
});
