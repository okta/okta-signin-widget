import { loc, createButton, View } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorVerifyFooter from '../../components/AuthenticatorVerifyFooter';
import polling from '../shared/polling';

const Body = BaseForm.extend(Object.assign(
  {
    noButtonBar: true,

    className: 'okta-verify-push-challenge',

    title () {
      return loc('oie.okta_verify.push.title', 'login');
    },

    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);
      this.listenTo(this.model, 'error', this.onPollingFail);
      this.add(createButton({
        className: 'ul-button button button-wide button-primary send-push',
        title: loc('oie.okta_verify.push.sent', 'login'),
        click: () => {
          this.disablePush();
          this.startDevicePolling();
        }
      }));
    },

    postRender () {
      this.disablePush();
      this.startDevicePolling();
    },

    onPollingFail () {
      this.stopPolling();
      this.enablePush();
    },

    disablePush () {
      const button = this.$el.find('.send-push');
      button.addClass('link-button-disabled');
      button.prop('value', loc('oktaverify.sent', 'login'));
      button.prop('disabled', true);
    },

    enablePush () {
      const button = this.$el.find('.send-push');
      button.removeClass('link-button-disabled');
      button.prop('value', loc('oktaverify.send', 'login'));
      button.prop('disabled', false);
    },
  },

  polling,
));

export default BaseAuthenticatorView.extend({
  Body,
  Footer: AuthenticatorVerifyFooter,
});