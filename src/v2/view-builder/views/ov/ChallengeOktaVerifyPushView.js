import { _, loc, createButton, View } from 'okta';
import hbs from 'handlebars-inline-precompile';
import BaseForm from '../../internals/BaseForm';
import polling from '../shared/polling';
import { WARNING_TIMEOUT } from '../../utils/Constants';

const warningTemplate = View.extend({
  className: 'okta-form-infobox-warning infobox infobox-warning',
  template: hbs`
    <span class="icon warning-16"></span>
    <p>{{warning}}</p>
  `
});

const Body = BaseForm.extend(Object.assign(
  {
    noButtonBar: true,

    className: 'okta-verify-push-challenge',

    title () {
      return loc('oie.okta_verify.push.title', 'login');
    },

    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);
      this.listenTo(this.model, 'error', this.stopPoll);
      this.addView();
    },

    addView () {
      this.add(createButton({
        className: 'button button-wide button-primary send-push link-button-disabled',
        title: loc('oie.okta_verify.push.sent', 'login'),
        click: (e) => {
          e.preventDefault();
        }
      }));
      this.add(
        `<span class='accessibility-text' role='alert'>${loc('oie.okta_verify.push.sent', 'login')}</span>`,
      );
    },

    postRender () {
      this.startPoll();
    },

    startPoll () {
      this.startPolling();
      this.warningTimeout = setTimeout(_.bind(function () {
        this.showWarning(loc('oktaverify.warning', 'login'));
      }, this), WARNING_TIMEOUT);
    },

    stopPoll () {
      this.stopPolling();
      this.clearWarning();
    },

    showWarning (msg) {
      this.clearWarning();
      this.add(warningTemplate, '.o-form-error-container', {options: {warning: msg}});
    },

    clearWarning () {
      if (this.$('.o-form-error-container div').hasClass('okta-form-infobox-warning')) {
        this.$('.okta-form-infobox-warning').remove();
      }
      clearTimeout(this.warningTimeout);
    },

    remove () {
      BaseForm.prototype.remove.apply(this, arguments);
      this.stopPolling();
    },
  },

  polling,
));

export default Body;
