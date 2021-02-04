import { loc } from 'okta';
import Duo from 'duo';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorEnrollFooter from '../../components/AuthenticatorEnrollFooter';

const Body = BaseForm.extend({

  className: 'duo-authenticator-challenge',
  noButtonBar: true,

  title  () {
    return loc('oie.duo.verify.title', 'login');
  },

  postRender: function () {
    const contextualData = this.options.appState.get('currentAuthenticator').contextualData;
    // TODO Check contextualData.integrationType once we support other types than iframe
    this.add('<iframe frameborder="0" title="' + this.title() + '"></iframe>');
    Duo.init({
      host: contextualData.host,
      sig_request: contextualData.signedToken, // eslint-disable-line camelcase
      iframe: this.$('iframe').get(0),
      post_action: (signedData) => {  // eslint-disable-line camelcase
        this.model.set('credentials.signatureData', signedData);
        this.saveForm(this.model);
      },
    });
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer: AuthenticatorEnrollFooter,
});
