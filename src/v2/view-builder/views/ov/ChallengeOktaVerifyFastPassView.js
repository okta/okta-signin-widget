import { _, View, createCallout } from '@okta/courage';
import { BaseOktaVerifyChallengeView } from '../../internals';
import { getBiometricsErrorOptions } from '../../utils/ChallengeViewUtil';
import {
  OV_UV_ENABLE_BIOMETRICS_FASTPASS_MOBILE,
  OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP,
  OV_UV_ENABLE_BIOMETRICS_FASTPASS_WINDOWS,
} from '../../utils/Constants';

const Body = BaseOktaVerifyChallengeView.extend({
  getDeviceChallengePayload() {
    return this.options.currentViewState.relatesTo.value.contextualData.challenge.value;
  },

  showMessages(options) {
    // When called from showCustomFormErrorCallout with a pre-built View, pass through
    // to avoid re-formatting or creating a loop
    if (options instanceof View) {
      BaseOktaVerifyChallengeView.prototype.showMessages.call(this, options);
      return;
    }

    // Check if global messages contain biometrics error keys
    if (this.options.appState.containsMessageWithI18nKey([
      OV_UV_ENABLE_BIOMETRICS_FASTPASS_MOBILE,
      OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP,
      OV_UV_ENABLE_BIOMETRICS_FASTPASS_WINDOWS,
    ])) {
      const messages = this.options.appState.get('messages');
      const biometricsOptions = getBiometricsErrorOptions(messages, true);
      if (!_.isEmpty(biometricsOptions)) {
        options = createCallout(biometricsOptions);
      }
    }

    BaseOktaVerifyChallengeView.prototype.showMessages.call(this, options);
  },

  showCustomFormErrorCallout(error) {
    const options = getBiometricsErrorOptions(error, false);
    
    // If not biometrics error, just show the returned error message
    if (_.isEmpty(options)) {
      return false;
    }

    this.showMessages(createCallout(options));
    return true;
  },
});

export default Body;
