import { loc, View } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import ScopeList from '../../../views/admin-consent/ScopeList';
import consentLogoHeaderTemplate from '../../../views/shared/templates/consentLogoHeaderTemplate';


const Header = View.extend({
  className: 'consent-title detail-row',
  template: consentLogoHeaderTemplate,
  getTemplateData: function () {
    const {label: appName, clientURI } =  this.options.appState.get('app');
    const customLogo = (this.settings.get('logo') || {}).href;
    const defaultLogo = this.settings.get('baseUrl') + '/img/logos/default.png';
    const issuer = this.settings.get('baseUrl') + '/oauth2/default';
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

    events: {
      'click .button-primary': 'changeScopes'
    },

    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);

      const scopes = this.getUISchema().map(({label, desc}) => {
        return {name: label, displayName: label, description: desc};
      });
      this.model.set('scopes', scopes);
      this.add(ScopeList, {options: {model: this.model}});
    },

    changeScopes() {
      const scopes = this.getUISchema().map(({value}) => {
        return value;
      });
      this.model.set('scopes', scopes);
    },

    postRender() {
      this.$el.find('.o-form-content').remove();
      // Move buttons in DOM to match visual hierarchy to fix tab order.
      const buttonContainer = this.$el.find('.o-form-button-bar');
      buttonContainer.find('.button-primary').appendTo(buttonContainer);
    }
  },
);

export default BaseView.extend({
  className: 'admin-consent-required',
  Header,
  Body
});
