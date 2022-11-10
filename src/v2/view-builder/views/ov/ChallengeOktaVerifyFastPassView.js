import { _, createCallout } from '@okta/courage';
import { BaseOktaVerifyChallengeView } from '../../internals';
import { getBiometricsErrorOptions } from '../../utils/ChallengeViewUtil';

const Body = BaseOktaVerifyChallengeView.extend({
  getDeviceChallengePayload() {
    return this.options.currentViewState.relatesTo.value.contextualData.challenge.value;
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
