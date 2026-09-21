import ChallengeOktaVerifyTotpView from 'v2/view-builder/views/ov/ChallengeOktaVerifyTotpView';
import { loc } from '@okta/courage';

describe('v2/view-builder/views/ov/ChallengeOktaVerifyTotpView', function() {
  const OR_PIN_KEY = 'oie.authenticator.oktaverify.method.totp.verify.enable.biometrics_or_pin';
  const BIOMETRICS_KEY = 'oie.authenticator.oktaverify.method.totp.verify.enable.biometrics';
  const Body = ChallengeOktaVerifyTotpView.prototype.Body;

  let testContext;

  beforeEach(function() {
    testContext = { showMessages: jest.fn() };
  });

  function showCustomFormErrorCallout(error) {
    return Body.prototype.showCustomFormErrorCallout.call(testContext, error);
  }

  function errorWithKeys(errorSummaryKeys) {
    return { responseJSON: { errorSummaryKeys } };
  }

  function calloutOptions() {
    return testContext.showMessages.mock.calls[0][0].options;
  }

  describe('showCustomFormErrorCallout', function() {
    it('renders the screen lock callout for the biometrics_or_pin key', function() {
      expect(showCustomFormErrorCallout(errorWithKeys([OR_PIN_KEY]))).toBe(true);
      expect(testContext.showMessages).toHaveBeenCalledTimes(1);

      const options = calloutOptions();
      expect(options.type).toBe('error');
      expect(options.className).toBe('okta-verify-uv-callout-content');
      expect(options.title).toBe(loc(`${OR_PIN_KEY}.title`, 'login'));
      expect(options.subtitle).toBe(loc(`${OR_PIN_KEY}.description`, 'login'));
      expect(options.bullets).toEqual([
        loc(`${OR_PIN_KEY}.point1`, 'login'),
        loc(`${OR_PIN_KEY}.point2`, 'login'),
      ]);
    });

    it('does not fall through to the biometrics-only copy for the biometrics_or_pin key', function() {
      showCustomFormErrorCallout(errorWithKeys([OR_PIN_KEY]));

      const options = calloutOptions();
      expect(options.title).not.toBe(loc('oie.authenticator.app.method.push.verify.enable.biometrics.title', 'login'));
      expect(options.bullets).not.toContain(
        loc('oie.authenticator.app.method.push.verify.enable.biometrics.point1', 'login')
      );
    });

    it('still renders the biometrics-only callout with 3 bullets for the old key', function() {
      expect(showCustomFormErrorCallout(errorWithKeys([BIOMETRICS_KEY]))).toBe(true);
      expect(calloutOptions().bullets).toHaveLength(3);
    });

    it('prefers the screen lock copy when both keys are present', function() {
      showCustomFormErrorCallout(errorWithKeys([BIOMETRICS_KEY, OR_PIN_KEY]));

      expect(testContext.showMessages).toHaveBeenCalledTimes(1);
      expect(calloutOptions().title).toBe(loc(`${OR_PIN_KEY}.title`, 'login'));
    });

    it('does not handle unrelated error keys', function() {
      expect(showCustomFormErrorCallout(errorWithKeys(['some.other.error.key']))).toBeUndefined();
      expect(testContext.showMessages).not.toHaveBeenCalled();
    });

    it('does not handle a response without errorSummaryKeys', function() {
      expect(showCustomFormErrorCallout({})).toBeUndefined();
      expect(testContext.showMessages).not.toHaveBeenCalled();
    });
  });
});
