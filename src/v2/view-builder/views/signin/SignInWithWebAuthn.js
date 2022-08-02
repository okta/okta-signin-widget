import { _, View, createButton } from 'okta';
import hbs from 'handlebars-inline-precompile';
import { FORMS } from '../../../ion/RemediationConstants';
import transformIdxResponse from '../../../ion/transformIdxResponse';
import { getMessageFromBrowserError } from '../../../ion/i18nTransformer';
import sessionStorageHelper from '../../../client/sessionStorageHelper';
import CryptoUtil from 'util/CryptoUtil';

export default View.extend({
  className: 'sign-in-with-device-option',
  template: hbs`
    <div class="okta-verify-container">
    </div>
    <div class="separation-line">
      <span>{{i18n code="authbutton.divider.text" bundle="login"}}</span>
    </div>
  `,
  initialize() {
    this.add(createButton({
      className: 'button',
      icon: 'okta-verify-authenticator',
      title: 'Use Touch ID',
      click: async () => {
        //this.handleWebAuthnWithInterstitial();
        await this.handleWebAuthnWithoutInterstitial();
      }
    }), '.okta-verify-container');
  },
  handleWebAuthnWithInterstitial: function(){
    this.options.appState.trigger('invokeAction', FORMS.LAUNCH_WEBAUTHN_AUTHENTICATOR);
  },
  handleWebAuthnWithoutInterstitial: async function(){
    //get response from idx/webauthn/launch api call
    const actionPath = "launch-webauthn-authenticator";
    const { appState, settings } = this.options;
    const idx = appState.get('idx');
    const { stateHandle } = idx.context;
    let invokeOptions = {exchangeCodeForTokens: false, shouldProceedWithEmailAuthenticator: false, stateHandle, step: actionPath };
    const authClient = this.options.settings.getAuthClient();
    let resp;
    try {
      resp = await authClient.idx.proceed(invokeOptions);
      if (resp.requestDidSucceed === false) {
        this.displayError(resp);
        return;
      }
    } catch (e) {
      this.displayError(e);
      return;
    }

    //webauthn
    const challengeData = resp.context.currentAuthenticator.value.contextualData.challengeData;
    this.webauthnAbortController = new AbortController();
    const options = _.extend({}, challengeData, {
      allowCredentials: [],
      challenge: CryptoUtil.strToBin(challengeData.challenge),
    });
    navigator.credentials.get({
      publicKey: options,
      signal: this.webauthnAbortController.signal
    }).then(async (assertion) => {
      //process idx response and set appState
      const lastResponse = this.options.appState.get('idx');
      if (lastResponse) {
        sessionStorageHelper.setStateHandle(resp?.context?.stateHandle);
      }
      const ionResponse = transformIdxResponse(this.options.settings, resp, lastResponse);
      this.options.appState.clearAppStateCache();
      this.options.appState.set(ionResponse);

      //process webauthn response
      const userHandle = CryptoUtil.binToStr(assertion.response.userHandle);
      console.log("userHandle: " + userHandle);
      this.model.set({
        formName: 'challenge-authenticator',
        credentials : {
          clientData: CryptoUtil.binToStr(assertion.response.clientDataJSON),
          authenticatorData: CryptoUtil.binToStr(assertion.response.authenticatorData),
          signatureData: CryptoUtil.binToStr(assertion.response.signature),
          userHandle: userHandle,
        }
      });
      this.options.appState.trigger('saveForm', this.model);
    }, (error) => {
      if (this.webauthnAbortController) {
        this.displayError(error);
      }
    }).finally(() => {
      this.webauthnAbortController = null;
    });
  },
  displayError: function(error){
    console.log(error);
    this.model.trigger('error', this.model, {responseJSON: {errorSummary: getMessageFromBrowserError(error)}});
  }
});

