import BaseFactorView from './BaseFactorView';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';

const TerminalBody = BaseForm.extend({
  title () {
    const msg = this.options.appState.get('terminal').message || {};
    return msg.value || 'You can close this window';
  },
  noButtonBar: true,
});

const TerminalFooter = BaseFooter.extend({
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

export default BaseFactorView.extend({
  Body: TerminalBody,
  Footer: TerminalFooter,
});
