import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import Util from '../../../util/Util';

const Body = BaseForm.extend({
  noButtonBar: true,

  title: 'You are being redirected',

  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    document.cookie = `stateHandle=${this.options.appState.get('currentState').stateHandle};path=/`;
    Util.redirectWithFormGet(this.options.currentViewState.href);
  }
});

export default BaseView.extend({
  Body,
});
