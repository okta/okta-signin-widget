import { loc, createCallout } from 'okta';
import Duo from 'duo';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorEnrollFooter from '../../components/AuthenticatorEnrollFooter';

const Body = BaseForm.extend({

  noButtonBar: true,

  title  () {
    return loc('oie.duo.verify.title', 'login');
  },

  postRender: function () {
    const contextualData = this.options.appState.get('currentAuthenticator').contextualData;
    // This is the place to check contextualData.integrationType once we support more types
    // Currently we only support IFRAME
    const duoFrame = this.add(`<iframe frameborder="0" title="'${this.title()}'"></iframe>`).last();
    try {
      Duo.init({
        host: contextualData.host,
        sig_request: contextualData.signedToken, // eslint-disable-line camelcase
        iframe: duoFrame.el,
        post_action: (signedData) => { // eslint-disable-line camelcase
          this.model.set('credentials.signatureData', signedData);
          this.saveForm(this.model);
        },
      });
    } catch (e) {
      duoFrame.remove();
      this.add(createCallout({
        type: 'error',
        subtitle: loc('oie.duo.iFrameError', 'login'),
      }), '.o-form-error-container');
      console.error(e); // eslint-disable-line no-console
    }
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer: AuthenticatorEnrollFooter,
});
