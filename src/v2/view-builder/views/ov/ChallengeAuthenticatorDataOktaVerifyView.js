import { Collection, createButton, loc } from 'okta';
import { BaseForm, BaseFooter } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorVerifyOptions from '../../components/AuthenticatorVerifyOptions';
import { getAuthenticatorDataForVerification } from '../../utils/AuthenticatorUtil';
import { Body as SelectAuthenticatorVerifyViewBody } from '../SelectAuthenticatorVerifyView';
import { AUTHENTICATOR_KEY } from '../../../ion/RemediationConstants';

const Body = SelectAuthenticatorVerifyViewBody.extend({
  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    if (this.isPushOnlyFlow()) {
      this.addView();
    }
  },

  addView() {
    this.add(createButton({
      className: 'button button-wide button-primary send-push',
      title: loc('oie.okta_verify.sendPushButton', 'login'),
      click: () => {
        this.$el.submit();
      },
    }));
    this.add(
      `<span class='accessibility-text' role='alert'>${loc('oie.okta_verify.sendPushButton', 'login')}</span>`,
    );
  },

  postRender() {
    if (this.isPushOnlyFlow()) {
      this.$el.addClass('okta-verify-push-challenge');
      this.$el.find('.okta-form-subtitle').hide();
      // Move checkbox below the button
      const checkbox = this.$el.find('.o-form-fieldset');
      checkbox.length && this.$el.find('.o-form-fieldset-container').append(checkbox);
    }
  },

  getUISchema() {
    if (this.isPushOnlyFlow()) {
      // Prevent from displaying radio buttons on the UI
      const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
      return uiSchemas.filter(schema => schema.name !== 'authenticator.methodType');
    }
    // Change the UI schema to not display radios here.
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    const methodsSchema = uiSchemas.find(schema => schema.name === 'authenticator.methodType');

    this._sortMethodOptionsIfDeviceKnown(methodsSchema.options);

    const methodOptions = methodsSchema.options.map((option) => {
      return Object.assign({}, option, getAuthenticatorDataForVerification({authenticatorKey: AUTHENTICATOR_KEY.OV}));
    });
    return [{
      View: AuthenticatorVerifyOptions,
      options: {
        name: methodsSchema.name,
        collection: new Collection(methodOptions),
      }
    }];
  },

  // If the `deviceKnown` attribute is true, we should put the signed_nonce method to the top of authenticator list.
  // This is in sync with v2/ion/ui-schema/ion-object-handler.js - createOVOptions
  _sortMethodOptionsIfDeviceKnown(methodOptions) {
    // Check if the `deviceKnown` attribute is true
    const deviceKnown = this.options?.currentViewState?.relatesTo?.value?.deviceKnown;

    if (deviceKnown) {
      const signedNonceIndex = methodOptions.findIndex((e) => e.value === 'signed_nonce');

      if (signedNonceIndex > 0) {
        const signedNonceModel = methodOptions[signedNonceIndex];

        // Put the 'signed_nonce' option to the top of the list
        methodOptions.splice(signedNonceIndex, 1);
        methodOptions.unshift(signedNonceModel);
      }
    }
  }
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer: BaseFooter,
});
