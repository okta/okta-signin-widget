import { View, createButton, loc, $ } from 'okta';
import hbs from 'handlebars-inline-precompile';
import Util from '../../../../util/Util';

export default View.extend({
  className: 'sign-in-with-device-option',
  template: hbs`
    <div class="okta-verify-container"></div>
    <div class="separation-line"><span>OR</span></div>
  `,
  initialize () {
    const appState = this.options.appState;
    this.add(createButton({
      className: 'button',
      title: loc('oktaVerify.button', 'login'),
      click () {
        const rem = this.options.appState.get('remediations')
        .filter(v => v.name === 'launch-authenticator')[0];

        $.ajax({
          url: rem.href,
          method: rem.method,
          contentType: 'application/json',
          data: JSON.stringify({ stateHandle: rem.value[0].value }),
        })
        .then((resp) => {
          const deviceChallenge = resp[
            resp.remediation.value.filter(v => v.name === 'device-challenge-poll')[0].relatesTo
          ];
          Util.redirect(deviceChallenge.value.href);
          appState.trigger('invokeAction', 'launch-authenticator');
        });
      }
    }), '.okta-verify-container');
  },
});