import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import BaseFooter from '../internals/BaseFooter';
import { loc } from 'okta';

const Body = BaseForm.extend({
  title () {
    const msg = this.options.appState.get('terminal').message || {};
    return msg.message || loc('closeWindow', 'login');
  },
  noButtonBar: true,
  postRender () {
    BaseForm.prototype.postRender.apply(this, arguments);
    this.$el.addClass('terminal-state');
  },
});

const Footer = BaseFooter.extend({
  links () {
    return [
      {
        'type': 'link',
        'label': loc('backToSignin', 'login'),
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
