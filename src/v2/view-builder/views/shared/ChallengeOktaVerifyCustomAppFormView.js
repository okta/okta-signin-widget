// Common view for OV push and custom app.
import { Collection } from '@okta/courage';
import { BaseForm } from '../../internals';
import AuthenticatorVerifyOptions from '../../components/AuthenticatorVerifyOptions';
import {
  getAuthenticatorDataForVerification,
  isPhishingResistantMethod,
  partitionPhishingResistant,
} from '../../utils/AuthenticatorUtil';
import { Body as SelectAuthenticatorVerifyViewBody } from '../SelectAuthenticatorVerifyView';
import { AUTHENTICATOR_KEY } from '../../../ion/RemediationConstants';

const Body = SelectAuthenticatorVerifyViewBody.extend({
  getUISchema() {
    // Change the UI schema to not display radios here.
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    const methodsSchema = uiSchemas.find(schema => schema.name === 'authenticator.methodType');

    this._sortMethodOptionsIfDeviceKnown(methodsSchema.options);

    const methodOptions = methodsSchema.options.map((option) => {
      return Object.assign({}, option, getAuthenticatorDataForVerification({authenticatorKey:
            this.isOV() ? AUTHENTICATOR_KEY.OV : AUTHENTICATOR_KEY.CUSTOM_APP, value: { methodType: option.value } }));
    });
    // Phishing resistant methods first; the rest are collapsed under "More options".
    // Only grouped when the list has both kinds, otherwise the list is flat as before.
    const authenticators = this.options.appState.get('idx')?.rawIdxState?.authenticators?.value;
    const authenticatorId = this.options.currentViewState?.value
      ?.find(v => v.name === 'authenticator')?.form?.value?.find(v => v.name === 'id')?.value;
    const flagged = methodOptions.map(option => ({
      ...option,
      phishingResistant: isPhishingResistantMethod({
        authenticators, authenticatorId, methodType: option.value,
      }),
    }));
    const { items, moreItems } = partitionPhishingResistant(flagged);
    return [{
      View: AuthenticatorVerifyOptions,
      options: {
        name: methodsSchema.name,
        collection: new Collection(items),
        ...(moreItems ? { moreCollection: new Collection(moreItems) } : {}),
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
  },
  isOV() {
    return this.options.appState.get('authenticatorKey') === AUTHENTICATOR_KEY.OV;
  },
});

export default Body;
