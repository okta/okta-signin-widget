import BaseForm from '../../internals/BaseForm';
import BaseFactorView from '../shared/BaseFactorView';

const Body = BaseForm.extend({
  title: 'Sign in using a link sent to your email',
  subtitle () {
    return `Email will be sent to ${this.options.appState.get('authenticatorProfile').email}`;
  },
  save: 'Send Email Link',
},
);

export default BaseFactorView.extend({
  Body,
});
