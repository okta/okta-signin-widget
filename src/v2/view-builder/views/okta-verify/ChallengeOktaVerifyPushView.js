import { _, loc, createButton, View } from 'okta';
import hbs from 'handlebars-inline-precompile';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorVerifyFooter from '../../components/AuthenticatorVerifyFooter';
import polling from '../shared/polling';
import Util from '../../../../util/Util';

const WARNING_TIMEOUT = 30000;
const warningTemplate = View.extend({
  className: 'okta-form-infobox-warning infobox infobox-warning',
  template: hbs`
    <span class="icon warning-16"></span>
    <p>{{warning}}</p>
  `
});
let warningTimeout;

const Body = BaseForm.extend(Object.assign(
  {
    noButtonBar: true,

    className: 'okta-verify-push-challenge',

    title () {
      return loc('oie.okta_verify.push.title', 'login');
    },

    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);
      this.listenTo(this.model, 'error', this.stopPush);
      this.addView();
    },

    addView () {
      this.add(createButton({
        className: 'ul-button button button-wide button-primary send-push',
        title: loc('oie.okta_verify.push.sent', 'login'),
        click: () => {
          this.startPush();
        }
      }));
    },

    postRender () {
      this.startPush();
    },

    startPush () {
      this.disablePush();
      this.startDevicePolling();
      warningTimeout = Util.callAfterTimeout(_.bind(function () {
        this.showWarning(loc('oktaverify.warning', 'login'));
      }, this), WARNING_TIMEOUT);
    },

    stopPush () {
      this.stopPolling();
      this.clearWarning();
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

    showWarning (msg) {
      this.clearWarning();
      this.add(warningTemplate, '.o-form-error-container', {options: {warning: msg}});
    },

    clearWarning () {
      this.$('.okta-form-infobox-warning').remove();
      clearTimeout(warningTimeout);
    },
  },

  polling,
));

export default BaseAuthenticatorView.extend({
  Body,
  Footer: AuthenticatorVerifyFooter,
});