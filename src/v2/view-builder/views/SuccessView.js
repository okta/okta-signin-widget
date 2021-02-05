import { _, loc } from 'okta';

import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import Util from '../../../util/Util';
import { OKTA_STATE_TOKEN_KEY } from '../../view-builder/utils/Constants';


const Body = BaseForm.extend({
  title () {
    let titleString = loc('oie.success.text.signingIn', 'login');
    // For more info on the API response available in appState, see IdxResponseBuilder.java
    const app = this.options.appState.get('app');
    const user = this.options.appState.get('user');

    if (_.isEmpty(app)) {
      return titleString;
    }

    const {label: appInstanceName, name: appDisplayName} = app;
    const {identifier: userEmail} = user;

    const appName = appInstanceName ? appInstanceName : appDisplayName;

    if (appName && userEmail) {
      titleString = loc('oie.success.text.signingIn.with.appName.and.identifier', 'login', [appName, userEmail]);
    } else if (appName) {
      titleString = loc('oie.success.text.signingIn.with.appName', 'login', [appName]);
    }

    return titleString;
  },
  noButtonBar: true,
  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    // TODO OKTA-250473
    // Form post for success redirect
    const url = this.options.currentViewState.href;
    Util.redirectWithFormGet(url);
  },

  render () {
    BaseForm.prototype.render.apply(this, arguments);
    this.add('<div class="okta-waiting-spinner"></div>');
  }
});

export default BaseView.extend({
  Body,
  postRender () {
    BaseForm.prototype.postRender.apply(this, arguments);
    sessionStorage.removeItem(OKTA_STATE_TOKEN_KEY);
  }
});
