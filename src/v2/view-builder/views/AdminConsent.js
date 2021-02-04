import { loc, View, Model } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import ScopeList from '../../../views/admin-consent/ScopeList';
import consentLogoHeaderTemplate from '../../../views/shared/templates/consentLogoHeaderTemplate';


const Header = View.extend({
  className: 'consent-title detail-row',
  template: consentLogoHeaderTemplate,
  getTemplateData: function () {
    const {label: appName, clientUri = {} } =  this.options.appState.get('app');
    const customLogo = this.settings.get('logo');
    const defaultLogo = '/img/logos/default.png';
    const clientURI = clientUri.href;
    const { issuer: issuerObj = {} } = this.options.appState.get('authentication');
    const issuer = issuerObj.uri;

    return {
      appName, // escape?
      customLogo,
      defaultLogo,
      clientURI,
      issuer,
    };
  }
});

const Body = BaseForm.extend(
  {
    noButtonBar: false,
    noCancelButton: false,
    save: () => loc('consent.required.consentButton', 'login'),
    cancel: () => loc('consent.required.cancelButton', 'login'),

    /**
     * Format scopes for ScopeList and render ScopeList
     */
    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);
      this.uiSchema = this.getUISchema();

      const scopes = this.uiSchema.map(({label, desc}) => {
        return {name: label, displayName: label, description: desc};
      });
      const model = new Model({ scopes });
      this.add(ScopeList, {options: { model }});
    },
    /**
     * Format scopes to match the schema required by the server
     * POST /idp/idx/consent
        {
          "scopes": [ {{value}} ]
        }
     */
    saveForm () {
      const scopes = this.uiSchema.map(({value}) => {
        return value;
      });
      this.model.set('scopes', scopes);

      BaseForm.prototype.saveForm.apply(this, arguments);
    },

    postRender () {
      this.$el.find('.o-form-head').remove();
      this.$el.find('.o-form-fieldset-container').remove();
    }
  },
);

export default BaseView.extend({
  className: 'admin-consent-required',
  Header,
  Body,
  postRender () {
    // Move buttons in DOM to match visual hierarchy to fix tab order.
    // TODO https://oktainc.atlassian.net/browse/OKTA-350521
    const buttonContainer = this.$el.find('.o-form-button-bar');
    buttonContainer.find('.button-primary').appendTo(buttonContainer);
  }
});
