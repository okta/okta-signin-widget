import { loc, View, createCallout } from 'okta';
import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';
import BaseFactorView from '../shared/BaseFactorView';
import { addSwitchAuthenticatorLink } from '../../utils/AuthenticatorUtil';

const SHOW_RESEND_TIMEOUT = 30000;

const ResendView = View.extend(
  {
    // To be shown after a timeout
    className: 'phone-authenticator-challenge__resend-warning hide',
    events: {
      'click a.resend-link': 'handleResendLink'
    },

    initialize () {
      const resendText = (this.model.get('mode') === 'sms')
        ? loc('oie.phone.verify.sms.resendText', 'login')
        : loc('oie.phone.verify.call.resendText', 'login');
      const linkText = (this.model.get('mode') === 'sms')
        ? loc('oie.resend.link', 'login')
        : loc('oie.phone.verify.call.resendLinkText', 'login');
      this.add(createCallout({
        content: `${resendText}&nbsp;<a class='resend-link'>${linkText}</a>`,
        type: 'warning',
      }));
    },

    handleResendLink () {
      this.options.appState.trigger('invokeAction', 'currentAuthenticatorEnrollment-resend');
      // Hide warning, but start a timeout again..
      if (!this.el.classList.contains('hide')) {
        this.el.classList.add('hide');
      }
      this.showCalloutAfterTimeout();
    },

    postRender () {
      this.showCalloutAfterTimeout();
    },

    showCalloutAfterTimeout () {
      this.showCalloutTimer = setTimeout(() => {
        this.el.classList.remove('hide');
      }, SHOW_RESEND_TIMEOUT);
    },

    remove () {
      View.prototype.remove.apply(this, arguments);
      clearTimeout(this.showCalloutTimer);
    }
  },
);

const Body = BaseForm.extend(Object.assign(
  {
    className: 'phone-authenticator-challenge',
    subtitle: ' ',

    title () {
      return loc('oie.phone.verify.title', 'login');
    },

    save () {
      return loc('oie.verify.button', 'login');
    },

    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);
    },

    render () {
      BaseForm.prototype.render.apply(this, arguments);
      const subtitleElement = this.el.querySelector('.okta-form-subtitle');
      const sendText = (this.model.get('mode') === 'sms')
        ? loc('oie.phone.verify.sms.codeSentText', 'login')
        : loc('mfa.calling', 'login');
      const enterCodeText = loc('oie.phone.verify.enterCodeText', 'login');
      // Override message in form subtitle so that we can add html content to it.
      // Courage form subtitle doesn't support html tags.
      subtitleElement.innerText = '';
      this.add(
        `${sendText}&nbsp;<span class='strong'>${this.model.get('phoneNumber')}.</span>&nbsp;${enterCodeText}`,
        '.okta-form-subtitle'
      );
    },

    postRender () {
      this.add(ResendView, {
        selector: '.o-form-error-container',
        prepend: true,
      });
    },
  },
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
    const { methods, profile } = this.options.appState.get('currentAuthenticatorEnrollment');
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const local = Object.assign({
      mode: {
        'value': methods[0].type,
        'type': 'string',
      },
      phoneNumber: {
        'value': profile.phoneNumber,
        'type': 'string',
      }
    });
    return ModelClass.extend({ local });
  },
});
