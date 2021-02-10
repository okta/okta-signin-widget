import { View, _ } from 'okta';

import consentLogoHeaderTemplate from '../../../../views/shared/templates/consentLogoHeaderTemplate';

const defaultLogo = '/img/logos/default.png';

const ConsentViewHeader = View.extend({
  className: 'consent-title detail-row',
  template: consentLogoHeaderTemplate,
  getTemplateData: function () {
    const { appState } = this.options;
    const { currentFormName } = appState.get('currentFormName');
    const { label, clientUri, logo } =  appState.get('app');
    const { issuer: issuerObj } = appState.get('authentication');
    const customLogo = logo?.href;

    const appName = _.escape(label);
    const clientURI = clientUri?.href;
    const issuer = currentFormName === 'admin-consent' ? issuerObj?.uri : null;

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
