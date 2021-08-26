import { loc, View } from 'okta';
import { BaseForm, BaseView } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import sessionStorageHelper from '../../../client/sessionStorageHelper';
import { addUserFeedbackCallout } from '../../utils/ResendViewUtil';

const ResendView = View.extend(
  {
    // To be shown after a timeout
    className: 'phone-authenticator-challenge__resend-warning',
    events: {
      'click a.resend-link': 'handleResendLink'
    },

    // Override this to change the resend action location from response
    resendActionKey: 'currentAuthenticatorEnrollment-resend',

    initialize() {
      const resendContext = this.options.appState.get('currentAuthenticatorEnrollment')?.resend;

      if (resendContext) {
        const resendText = (this.model.get('mode') === 'sms')
          ? loc('oie.phone.verify.sms.resendText', 'login')
          : loc('oie.phone.verify.call.resendText', 'login');
        const linkText = (this.model.get('mode') === 'sms')
          ? loc('oie.phone.verify.sms.resendLinkText', 'login')
          : loc('oie.phone.verify.call.resendLinkText', 'login');
        
        const content = `${resendText}&nbsp;<a class='resend-link'>${linkText}</a>`;
        this.add(`<div class="ion-messages-container">${content}</div>`);
      }
      // this.add(createCallout({
      //   type: 'warning',
      // }));
    },

    handleResendLink() {
      this.options.appState.trigger('invokeAction', this.resendActionKey);
      sessionStorageHelper.setResendTimestamp(Date.now());

      const contextualData = this.options.appState.get('currentAuthenticatorEnrollment')?.contextualData;
      let content;
      if (this.model.get('mode') === 'sms') {
        content = contextualData?.phoneNumber
          ? `${loc('oie.sms.code.user.feedback.with.phoneNumber', 'login', 
            [contextualData.phoneNumber])}`
          :`${loc('oie.sms.code.user.feedback', 'login')}`;
      } else {
        content = contextualData?.phoneNumber
          ? `${loc('oie.phone.call.user.feedback.with.phoneNumber', 'login', 
            [contextualData.phoneNumber])}`
          :`${loc('oie.phone.call.user.feedback', 'login')}`;
      }
  
      this.userFeedbackTimeout = addUserFeedbackCallout(content, this);
    },

    remove() {
      View.prototype.remove.apply(this, arguments);
      clearTimeout(this.userFeedbackTimeout);
    }
  },
);

const Body = BaseForm.extend(Object.assign(
  {
    className: 'phone-authenticator-challenge',

    title() {
      return loc('oie.phone.verify.title', 'login');
    },

    save() {
      return loc('mfa.challenge.verify', 'login');
    },

    initialize() {
      BaseForm.prototype.initialize.apply(this, arguments);
      const sendText = (this.model.get('mode') === 'sms')
        ? loc('oie.phone.verify.sms.codeSentText', 'login')
        : loc('mfa.calling', 'login');
      const enterCodeText = loc('oie.phone.verify.enterCodeText', 'login');
      const carrierChargesText = loc('oie.phone.carrier.charges', 'login');

      const strongClass = this.model.get('phoneNumber') !== loc('oie.phone.alternate.title', 'login') ?
        'strong no-translate' : '';
      // Courage doesn't support HTML, hence creating a subtitle here.
      this.add(`<div class="okta-form-subtitle" data-se="o-form-explain">
        ${sendText}&nbsp;<span class='${strongClass}'>${this.model.escape('phoneNumber')}.</span>
        &nbsp;${enterCodeText}
        <p>${carrierChargesText}</p>
        </div>`, {
        prepend: true,
        selector: '.o-form-fieldset-container',
      });
    },

    postRender() {
      BaseForm.prototype.postRender.apply(this, arguments);
      this.add(ResendView, {
        selector: '.o-form-error-container',
        prepend: true,
      });
    },
  },
));

export default BaseAuthenticatorView.extend({
  Body,

  createModelClass() {
    const relatesToObject = this.options.currentViewState.relatesTo;
    const { methods, profile } = relatesToObject?.value || {};
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const local = Object.assign({
      mode: {
        'value': methods[0].type,
        'type': 'string',
      },
      phoneNumber: {
        'value': profile?.phoneNumber ? profile.phoneNumber : loc('oie.phone.alternate.title', 'login'),
        'type': 'string',
      }
    }, ModelClass.prototype.local );
    return ModelClass.extend({ local });
  },
});

export { ResendView };