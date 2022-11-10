import { loc, createCallout } from '@okta/courage';
import Duo from '@okta/duo';
import { BaseForm } from '../../internals';

export default BaseForm.extend({

  noButtonBar: true,

  postRender: function() {
    const contextualData = this.getContextualData();
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

  getContextualData() {
    // to be overriden
  }
});
