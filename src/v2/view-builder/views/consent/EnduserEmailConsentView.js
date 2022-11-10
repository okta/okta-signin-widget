import { loc } from '@okta/courage';
import { BaseForm } from '../../internals';
import ConsentViewForm from './ConsentViewForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import hbs from '@okta/handlebars-inline-precompile';
import EmailAuthenticatorHeader from '../../components/EmailAuthenticatorHeader';

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
  {{/if}}`;
const enduserEmailConsentViewBody = ConsentViewForm.extend({
  className: 'enduser-email-consent',

  title() {
    return loc('oie.consent.enduser.title', 'login');
  },
  save() {
    return loc('oie.consent.enduser.accept.label', 'login');
  },
  cancel() {
    return loc('oie.consent.enduser.deny.label', 'login');
  },
  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    const info = getInfo(this.model.pick('browser', 'app'));
    this.add(info);
  },
  getUISchema() {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    return uiSchemas.filter(uiSchema => uiSchema.name !== 'consent' );
  },
});

export default BaseAuthenticatorView.extend({
  Header: EmailAuthenticatorHeader,

  buttonOrder: ['cancel', 'save'],

  postRender() {
    const buttonContainer = this.$el.find('.o-form-button-bar');
    buttonContainer.find('.button-primary').removeClass('button-primary');
  },

  Body: enduserEmailConsentViewBody,

  createModelClass({ requestInfo }) {
    const ModelClass = BaseAuthenticatorView.prototype.createModelClass.apply(this, arguments);
    const browser = requestInfo.find(({ name }) => name === 'browser');
    const app = requestInfo.find(({ name }) => name === 'appName');

    const local = Object.assign({
      browser: {
        type: 'string',
        value: browser?.value
      },
      app: {
        type: 'string',
        value: app?.value
      },
    }, ModelClass.prototype.local );
    return ModelClass.extend({
      local,
      toJSON() {
        return {
          consent: this.get('consent'),
        };
      },
    });
  }
});
