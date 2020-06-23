import { loc, View, createCallout, _ } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';
import BaseView from '../../internals/BaseView';
import email from '../shared/email';
import polling from '../shared/polling';
import BaseFactorView from '../shared/BaseFactorView';
import { addSwitchAuthenticatorLink } from '../../utils/AuthenticatorUtil';
import { SHOW_RESEND_TIMEOUT } from '../../utils/Constants';

const ResendView = View.extend(
  {
    className: 'hide resend-email-view',
    events: {
      'click a.resend-link' : 'handelResendLink'
    },

    initialize () {
      this.add(createCallout({
        content: `${loc('email.code.not.received', 'login')}
        <a class='resend-link'>${loc('email.button.resend', 'login')}</a>`,
        type: 'warning',
      }));
    },

    handelResendLink () {
      this.options.appState.trigger('invokeAction', 'currentAuthenticatorEnrollment-resend');
      // Hide warning, but reinitiate to show warning again after some threshold of polling
      if (!this.el.classList.contains('hide')) {
        this.el.classList.add('hide');
      }
      this.showCalloutWithDelay();
    },

    postRender () {
      this.showCalloutWithDelay();
    },

    showCalloutWithDelay () {
      this.showMeTimeout = _.delay(() => {
        this.$el.removeClass('hide');
      }, SHOW_RESEND_TIMEOUT);
    },

    remove () {
      View.prototype.remove.apply(this, arguments);
      clearTimeout(this.showMeTimeout);
    }
  },
);

const Body = BaseForm.extend(Object.assign(
  {
    save () {
      return loc('oie.verify.button', 'login');
    },
    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);
      const sendText = loc('oie.email.verify.sentText', 'login');
      const enterCodeText = loc('oie.email.verify.codeText', 'login');

      // Courage doesn't support HTML, hence creating a subtitle here.
      this.add(`<div class="okta-form-subtitle" data-se="o-form-explain">
        ${sendText}&nbsp;<span class='strong'>${this.model.escape('email')}.</span>
        ${enterCodeText}</div>`, {
        prepend: true,
        selector: '.o-form-error-container',
      });

      this.add(ResendView, {
        selector: '.o-form-error-container',
      });
      this.startPolling();

      // polling has been killed when click save to avoid race conditions hence resume if save failed.
      this.listenTo(this.options.model, 'error', this.startPolling.bind(this));
    },

    saveForm () {
      BaseForm.prototype.saveForm.apply(this, arguments);
      this.stopPolling();
    },

    remove () {
      BaseForm.prototype.remove.apply(this, arguments);
      this.stopPolling();
    }
  },

  email,
  polling,
));

const Footer = BaseFooter.extend({
  links () {
    const links = [];
    addSwitchAuthenticatorLink(this.options.appState, links);
    return links;
  }
});

export default BaseFactorView.extend({
  Body,
  Footer,
  createModelClass () {
    const { profile } = this.options.currentViewState.relatesTo.value;
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const local = Object.assign({
      email: {
        'value': profile.email,
        'type': 'string',
      }
    }, ModelClass.prototype.local );
    return ModelClass.extend({ local });
  },
});
