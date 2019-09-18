import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import { $ } from 'okta';

const Body = BaseForm.extend({
  title () {
    return  'You will be redirected';
  },
  noButtonBar: true,
  initialize (options) {

    BaseForm.prototype.initialize.apply(this, arguments);
    // TODO OKTA-250473
    // Form post for success redirect
    const data = {
      stateHandle: options.appState.get('currentState').stateHandle
    };
    return $.post({
      url: options.appState.getCurrentViewState().href,
      method: 'POST',
      data: data,
    });
  },
});

export default BaseView.extend({
  Body
});
