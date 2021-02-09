import { View } from 'okta';

import consentLogoHeaderTemplate from '../../../../views/shared/templates/consentLogoHeaderTemplate';


const ConsentViewHeader = View.extend({
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

export default ConsentViewHeader;
