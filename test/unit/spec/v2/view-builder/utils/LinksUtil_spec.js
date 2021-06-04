import AppState from 'v2/models/AppState';
import { FORMS } from 'v2/ion/RemediationConstants';
import { getSwitchAuthenticatorLink } from 'v2/view-builder/utils/LinksUtil';

describe('v2/utils/LinksUtil', function() {
  const mockAppState = (remediationFormName, hasMoreThanOneAuthenticator) => {
    const appState = new AppState();
    spyOn(appState, 'getRemediationAuthenticationOptions').and.callFake(formName => {
      if (formName === remediationFormName && hasMoreThanOneAuthenticator) {
        return [ { label: 'some authenticator '}, { label: 'another authenticator' } ];
      }
      return [];
    });
    return appState;
  };

  describe('getSwitchAuthenticatorLink', () => {
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
