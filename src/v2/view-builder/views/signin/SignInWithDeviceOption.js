import { View, createButton, loc, $ } from 'okta';
// import { fetchRequest } from '../../ion/httpClient';
import hbs from 'handlebars-inline-precompile';

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
        // appState.trigger('invokeAction', 'launch-authenticator');
        const rem = this.options.appState.get('rawIdxState').remediation.value
        .filter(v => v.name === 'launch-authenticator')[0];
        // fetchRequest(
        //   rem.href,
        //   rem.method,
        //   { stateHandle: rem.value[0].value }
        // )
        // .then((resp) => {
        //   const response = resp.response;
        //   const deviceChallenge = response[
        //     resp.response.remediation.value.filter(v => v.name === 'device-challenge-poll')[0].relatesTo
        //   ];
        //   Util.redirect(deviceChallenge.value.href);
        // });
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
        });
      }
    }), '.okta-verify-container');
  }
});