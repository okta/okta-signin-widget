import { loc } from 'okta';
import { BaseForm, BaseHeader } from '../../internals';
import ConsentViewForm from './ConsentViewForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import HeaderBeacon from '../../components/HeaderBeacon';
import { getIconClassNameForBeacon } from '../../utils/AuthenticatorUtil';
import { AUTHENTICATOR_KEY } from '../../../ion/RemediationConstants';

export default BaseAuthenticatorView.extend({
  className: 'enduser-email-consent',

  Header: BaseHeader.extend({
    HeaderBeacon: HeaderBeacon.extend({
      getBeaconClassName: function() {
        return getIconClassNameForBeacon(AUTHENTICATOR_KEY.EMAIL);
      },
    }),
  }),

  postRender() {
    // Move buttons in DOM to match visual hierarchy to fix tab order.
    // TODO https://oktainc.atlassian.net/browse/OKTA-350521
    const buttonContainer = this.$el.find('.o-form-button-bar');
    buttonContainer.find('.button-primary').appendTo(buttonContainer);
    buttonContainer.find('.button-primary').removeClass('button-primary');
  },

  Body: ConsentViewForm.extend({
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
