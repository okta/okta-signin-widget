import { View } from 'okta';
import { SHOW_RESEND_TIMEOUT } from '../../utils/Constants';
import sessionStorageHelper from '../../../client/sessionStorageHelper';

export default View.extend({

  postRender() {
    this.showCalloutAfterTimeout();
  },

  showCalloutAfterTimeout() {
    const timeStamp = sessionStorageHelper.getResendTimestamp();
    if (!timeStamp) {
      sessionStorageHelper.setResendTimestamp(Date.now());
    }

    // We keep track of a 'global' timestamp in sessionStorage because if the SIW does a re-render,
    // we don't want to force the user to wait another 30s again to see the resend link. With this
    // the user will wait AT MOST 30s until they see the resend link.
    this.showMeInterval = setInterval(() => {
      const start = sessionStorageHelper.getResendTimestamp();
      const now = Date.now();
      if (now - start >= SHOW_RESEND_TIMEOUT) {
        this.$el.removeClass('hide');
        clearInterval(this.showMeInterval);
        sessionStorageHelper.removeResendTimestamp();
      }
    }, 250);
  },

  remove() {
    View.prototype.remove.apply(this, arguments);
    clearInterval(this.showMeInterval);
  },
});
