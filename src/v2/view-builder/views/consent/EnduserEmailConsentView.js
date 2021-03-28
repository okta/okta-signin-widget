import { loc } from 'okta';
import { BaseForm } from '../../internals';
import ConsentViewForm from './ConsentViewForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

export default BaseAuthenticatorView.extend({
  className: 'enduser-email-consent',
  Body: ConsentViewForm.extend({
    title() {
      return loc('oie.consent.enduser.email.title', 'login');
    },
    save() {
      return loc('oie.consent.enduser.email.accept.label', 'login');
    },
    cancel() {
      return loc('oie.consent.enduser.email.deny.label', 'login');
    },
    initialize() {
      // this.options.appState.set('authenticatorKey', 'okta_email');
      BaseForm.prototype.initialize.apply(this, arguments);
      if (this.model.get('browser')) {
        this.add(`
          <div class="enduser-email-consent--info">
            <i class="enduser-email-consent--icon browser-icon"></i>
            <div>${this.model.get('browser')}</div>
          </div>
        `);
      }
      if (this.model.get('app')) {
        this.add(`
          <div class="enduser-email-consent--info">
            <i class="enduser-email-consent--icon app-icon"></i>
            <div>${this.model.get('app')}</div>
          </div>
        `);
      }
    },
    getUISchema() {
      const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
      return uiSchemas.filter(uiSchema => uiSchema.name !== 'consent' );
    },
  }),

  _getInfoObject(requestInfoArray, requestInfoName) {
    return requestInfoArray.find(({ name }) => (name === requestInfoName) );
  },

  createModelClass({ requestInfo }) {
    const ModelClass = BaseAuthenticatorView.prototype.createModelClass.apply(this, arguments);
    const { value: browser} = this._getInfoObject(requestInfo, 'browser');
    const { value: app } = this._getInfoObject(requestInfo, 'appName');

    const props = Object.assign({
      browser: {
        type: 'string',
        value: browser
      },
      app: {
        type: 'string',
        value: app
      },
    }, ModelClass.prototype.props );
    return ModelClass.extend({
      props,
      toJSON() {
        return {
          consent: this.get('consent'),
        };
      },
    });
  }
});
