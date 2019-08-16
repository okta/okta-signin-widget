import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';

const Body = BaseForm.extend({
  title: 'Sign in using a link sent to your email',
  subtitle () {
    return `Email will be sent to ${this.options.appState.get('factorProfile').email}`;
  },
  save: 'Send Email Link',
},
);

export default BaseView.extend({
  Body,
});
