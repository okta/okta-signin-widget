import { loc } from 'okta';
import { BaseView } from '../../internals';
import hbs from 'handlebars-inline-precompile';
import EmailAuthenticatorHeader from '../../components/EmailAuthenticatorHeader';
import TerminalView from '../TerminalView';

const getInfo = hbs`
  {{#if browser}}
    <div class="enduser-email-consent--info no-translate">
      <i class="enduser-email-consent--icon icon--desktop"></i>
      <div>{{browser}}</div>
    </div>
  {{/if}}
  {{#if app}}
    <div class="enduser-email-consent--info no-translate">
      <i class="enduser-email-consent--icon icon--app"></i>
      <div>{{app}}</div>
    </div>
  {{/if}}
  {{#if geolocation}}
    <div class="enduser-email-consent--info no-translate">
      <i class="enduser-email-consent--icon icon--app"></i>
      <div>{{geolocation}}</div>
    </div>
  {{/if}}
  {{#if otp}}
    <div class="enduser-email-consent--info no-translate">
      <i class="enduser-email-consent--icon icon--app"></i>
      <div>{{otp}}</div>
    </div>
  {{/if}}
  {{#if message}}
    <div class="enduser-email-consent--info no-translate">
      <i class="enduser-email-consent--icon icon--app"></i>
      <div>{{message}}</div>
    </div>
  {{/if}}`;
const returnOtpOnlyViewBody = TerminalView.extend({
  title() {
    return loc('idx.return.link.otponly.title', 'login');
  },
  initialize() {
    BaseView.prototype.initialize.apply(this, arguments);
    const info = getInfo(this.model.pick('browser', 'app', 'geolocation', 'otp', 'message'));
    this.add(info);
  },
  showMessages() {
    const otpOnlyWarningMsg = loc('idx.return.link.otponly.warning', 'login');

    this.add('<div class="ion-messages-container"></div>', '.o-form-error-container');
    this.add(`<p>${otpOnlyWarningMsg}</p>`, '.ion-messages-container');
  },
});

export default BaseView.extend({
  initialize() {
    BaseView.prototype.initialize.apply(this, arguments);
    this.Header = EmailAuthenticatorHeader;
    this.Body = returnOtpOnlyViewBody;
  },

  className: 'return-link-otp-only',

  postRender() {
    BaseForm.prototype.postRender.apply(this, arguments);
    this.$el.addClass('terminal-state');
  },

  createModelClass({ requestInfo }) {
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const browser = requestInfo.find(({ name }) => name === 'browser');
    const app = requestInfo.find(({ name }) => name === 'appName');
    const geolocation = requestInfo.find(({ name }) => name === 'geolocation');
    const otp = requestInfo.find(({ name }) => name === 'otp');
    const message = requestInfo.find(({ name }) => name === 'message');

    const local = Object.assign({
      browser: {
        type: 'string',
        value: browser?.value
      },
      app: {
        type: 'string',
        value: app?.value
      },
      geolocation: {
        type: 'string',
        value: geolocation?.value
      },
      otp: {
        type: 'string',
        value: otp?.value
      },
      message: {
        type: 'string',
        value: message?.value
      },
    }, ModelClass.prototype.local);
    return ModelClass;
  }
});
