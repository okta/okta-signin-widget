import EnrollPollOktaVerifyView from 'v2/view-builder/views/ov/EnrollPollOktaVerifyView';
import { BaseFormWithPolling } from 'v2/view-builder/internals';
import { loc } from '@okta/courage';

describe('v2/view-builder/views/ov/EnrollPollOktaVerifyView', function() {
  const OR_PIN_KEY = 'oie.authenticator.app.method.push.enroll.enable.biometrics_or_pin';
  const BIOMETRICS_KEY = 'oie.authenticator.app.method.push.enroll.enable.biometrics';
  const FIPS_IOS_KEY = 'oie.authenticator.app.non_fips_compliant_enrollment_device_incompatible';
  const Body = EnrollPollOktaVerifyView.prototype.Body;

  let superShowMessages;

  beforeEach(function() {
    superShowMessages = jest.spyOn(BaseFormWithPolling.prototype, 'showMessages').mockImplementation(() => {});
  });

  afterEach(function() {
    jest.restoreAllMocks();
  });

  // Returns the calloutOptions handed to the parent showMessages when `presentKeys`
  // are the only keys in the transaction messages.
  function showMessagesWith(presentKeys) {
    const context = {
      options: {
        appState: {
          containsMessageWithI18nKey: (key) => presentKeys.includes(key),
        },
      },
    };
    Body.prototype.showMessages.call(context);
    return superShowMessages.mock.calls[0][0];
  }

  describe('showMessages', function() {
    it('sets only the screen lock title for the biometrics_or_pin key', function() {
      // Only a title: enrollment renders the server's own sentence as the body, so adding
      // content or bullets here would replace it.
      expect(showMessagesWith([OR_PIN_KEY])).toEqual({
        title: loc(`${OR_PIN_KEY}.title`, 'login'),
      });
    });

    it('does not fall through to the biometrics-only title for the biometrics_or_pin key', function() {
      const calloutOptions = showMessagesWith([OR_PIN_KEY]);

      expect(calloutOptions.title).not.toBe(loc(`${BIOMETRICS_KEY}.title`, 'login'));
    });

    it('still sets the biometrics-only title for the old key', function() {
      expect(showMessagesWith([BIOMETRICS_KEY])).toEqual({
        title: loc(`${BIOMETRICS_KEY}.title`, 'login'),
      });
    });

    it('lets the FIPS title win over the biometrics_or_pin title', function() {
      expect(showMessagesWith([FIPS_IOS_KEY, OR_PIN_KEY])).toEqual({
        title: loc('oie.okta_verify.enroll.force.upgrade.title', 'login'),
      });
    });

    it('prefers the screen lock title when both enrollment keys are present', function() {
      expect(showMessagesWith([BIOMETRICS_KEY, OR_PIN_KEY])).toEqual({
        title: loc(`${OR_PIN_KEY}.title`, 'login'),
      });
    });

    it('passes no title for unrelated messages', function() {
      expect(showMessagesWith(['some.other.key'])).toEqual({});
    });
  });
});
