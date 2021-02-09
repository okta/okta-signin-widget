import { loc, View } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
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
    title: false,
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
  },
  createModelClass (currentViewState) {
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const scopes = currentViewState.uiSchema[0].options;

    return ModelClass.extend({
      props: {
        scopes: {type: 'array', value: scopes},
      },
      toJSON: function () {
        return {scopes: this.get('scopes').map(({name}) => name)};
      }
    });
  }
});
