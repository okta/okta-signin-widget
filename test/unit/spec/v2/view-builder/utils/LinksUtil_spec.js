import AppState from 'v2/models/AppState';
import { FORMS } from 'v2/ion/RemediationConstants';
import { getSwitchAuthenticatorLink } from 'v2/view-builder/utils/LinksUtil';

describe('v2/utils/LinksUtil', function() {
  const mockAppState = (remediationFormName, hasMoreThanOneAuthenticator) => {
    const appState = new AppState();
    spyOn(appState, 'hasRemediationObject').and.callFake(formName => formName === remediationFormName);
    spyOn(appState, 'hasMoreThanOneAuthenticatorOption').and.returnValue(hasMoreThanOneAuthenticator);
    return appState;
  };

  describe('getSwitchAuthenticatorLink', () => {
    it('returns empty when remediation form is not present', function() {
      const appState = mockAppState('other-form', true);
      expect(getSwitchAuthenticatorLink(appState)).toHaveLength(0);
    });

    describe('select-authenticator-authenticate', () => {
      it('returns a link when multiple authenticators available', function() {
        const appState = mockAppState(FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE, true);
        expect(getSwitchAuthenticatorLink(appState)).toHaveLength(1);
      });

      it('returns empty when just one authenticator available', function() {
        const appState = mockAppState(FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE, false);
        expect(getSwitchAuthenticatorLink(appState)).toHaveLength(0);
      });
    });

    describe('select-authenticator-enroll', () => {
      it('returns a link when multiple authenticators available', function() {
        const appState = mockAppState(FORMS.SELECT_AUTHENTICATOR_ENROLL, true);
        expect(getSwitchAuthenticatorLink(appState)).toHaveLength(1);
      });

      it('returns empty when just one authenticator available', function() {
        const appState = mockAppState(FORMS.SELECT_AUTHENTICATOR_ENROLL, false);
        expect(getSwitchAuthenticatorLink(appState)).toHaveLength(0);
      });
    });
  });
});
