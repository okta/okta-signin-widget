import { View, _ } from 'okta';

import consentLogoHeaderTemplate from '../../../../views/shared/templates/consentLogoHeaderTemplate';


const ConsentViewHeader = View.extend({
  className: 'consent-title detail-row',
  template: consentLogoHeaderTemplate,
  getTemplateData: function () {
    const { appState } = this.options;
    const { label, clientUri } =  appState.get('app');
    const { issuer: issuerObj } = appState.get('authentication');
    const customLogo = this.settings.get('logo');

    const appName = _.escape(label);
    const clientURI = clientUri?.href;
    const issuer = issuerObj?.uri;
    const defaultLogo = '/img/logos/default.png';

    return {
      appName,
      customLogo,
      defaultLogo,
      clientURI,
      issuer,
    };
  }
});

export default ConsentViewHeader;
