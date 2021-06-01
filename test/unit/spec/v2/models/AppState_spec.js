import AppState from 'v2/models/AppState';
import MockUtil from '../../../helpers/v2/MockUtil';
import XHRAuthenticatorChallengOktaVerify
  from '../../../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-push.json';
import { FORMS_FOR_VERIFICATION, FORMS_WITHOUT_SIGNOUT } from 'v2/ion/RemediationConstants';

describe('v2/models/AppState', function() {
  beforeEach(() => {
    this.initAppState = (idxObj, currentFormName) => {
      const appStateData = idxObj || { idx: { actions: {} } };
      if (currentFormName) {
        appStateData.currentFormName = currentFormName;
      }
      this.appState = new AppState(appStateData);
    };
  });

  describe('shouldShowSignOutLinkInCurrentForm', () => {
    it('returns false if there are no idx.actions', () => {
      this.initAppState();
      expect(this.appState.shouldShowSignOutLinkInCurrentForm()).toBe(false);
    });
    it('returns false if idx.actions.cancel is not defined', () => {
      this.initAppState({ idx: { actions: {} } });
      expect(this.appState.shouldShowSignOutLinkInCurrentForm()).toBe(false);
    });
    it('returns false if no idx.actions.cancel is not a function', () => {
      this.initAppState({ idx: { actions: { cancel: 'invalid' } } });
      expect(this.appState.shouldShowSignOutLinkInCurrentForm()).toBe(false);
    });
    it('returns false if param hideSignOutLinkInMFA is false but there is no remediation action', () => {
      this.initAppState({ idx: { actions: { } } });
      expect(this.appState.shouldShowSignOutLinkInCurrentForm(false)).toBe(false);
    });
    it('returns false if param hideSignOutLinkInMFA is true', () => {
      this.initAppState({ idx: { actions: { cancel: () => {} } } });
      expect(this.appState.shouldShowSignOutLinkInCurrentForm(true)).toBe(false);
    });
    it('returns true if param hideSignOutLinkInMFA is false', () => {
      this.initAppState({ idx: { actions: { cancel: () => {} } } });
      expect(this.appState.shouldShowSignOutLinkInCurrentForm(false)).toBe(true);
    });
    it('returns false if the currentFormName is in FORMS_WITHOUT_SIGNOUT', () => {
      this.initAppState({ idx: { actions: { cancel: () => {} } } }, FORMS_WITHOUT_SIGNOUT[0]);
      expect(this.appState.shouldShowSignOutLinkInCurrentForm()).toBe(false);
    });
  });

  describe('getAuthenticatorDisplayName', () => {
    it('returns the name of the authenticator when currentAuthenticator is present', () =>{
      this.initAppState({
        currentAuthenticator: {
          type: 'someType',
          key: 'someKey',
          id: 'someId',
          displayName: 'Display Name',
          methods: [
            { type: 'type' }
          ],
        },
      });
      expect(this.appState.getAuthenticatorDisplayName()).toBe('Display Name');
    });
    it('returns the name of the authenticator when currentAuthenticatorEnrollment is present', () =>{
      this.initAppState({
        currentAuthenticator: undefined, // Not provided (common case)
        currentAuthenticatorEnrollment: {
          type: 'someType',
          key: 'someKey',
          id: 'someId',
          displayName: 'Display Name',
          methods: [
            { type: 'type' }
          ],
        }
      });
      expect(this.appState.getAuthenticatorDisplayName()).toBe('Display Name');
    });
    it('returns the name of the currentAuthenticator when both current and enrollment exist', () =>{
      this.initAppState({
        currentAuthenticator: {
          type: 'someType',
          key: 'someKey',
          id: 'someId',
          displayName: 'Display Name',
          methods: [
            { type: 'type' }
          ],
        },
        currentAuthenticatorEnrollment: {
          type: 'someOtherType',
          key: 'someOtherKey',
          id: 'someOtherId',
          displayName: 'Display Other Name',
          methods: [
            { type: 'otherType' }
          ],
        },
      });
      expect(this.appState.getAuthenticatorDisplayName()).toBe('Display Name');
    });
  });

  describe('isAuthenticatorChallenge', () => {
    it('returns false if we are in an enroll view', () => {
      this.initAppState({}, 'enroll-authenticator');
      expect(this.appState.isAuthenticatorChallenge()).toBe(false);
    });
    it('returns true if in a verification view', () => {
      expect(FORMS_FOR_VERIFICATION).toHaveLength(4);
      FORMS_FOR_VERIFICATION.forEach(form => {
        this.initAppState({}, form);
        expect(this.appState.isAuthenticatorChallenge()).toBe(true);
      });
    });
  });

  describe('shouldReRenderView', () => {
    it('rerender view should be false if stateHandle are different', () => {

      const transformedResponse = {
        'idx': {
          'rawIdxState':{
            'version':'1.0.0',
            'stateHandle':'12345',
            'intent':'LOGIN',
            'remediation':{
              'type':'array',
              'value':[
                {
                  'rel':[
                    'create-form'
                  ],
                  'name':'device-challenge-poll',
                  'relatesTo':[
                    'authenticatorChallenge'
                  ],
                  'refresh':2000,
                  'value':[
                    {
                      'name':'stateHandle',
                      'required':true,
                      'value':'12345'
                    }
                  ]
                }
              ]
            }
          }}};

      const idxObj = {
        'idx': {
          'rawIdxState':{
            'version':'1.0.0',
            'stateHandle':'abcdf',
            'intent':'LOGIN',
            'remediation':{
              'type':'array',
              'value':[
                {
                  'rel':[
                    'create-form'
                  ],
                  'name':'device-challenge-poll',
                  'relatesTo':[
                    'authenticatorChallenge'
                  ],
                  'refresh':2000,
                  'value':[
                    {
                      'name':'stateHandle',
                      'required':true,
                      'value':'abcdf'
                    }
                  ]
                }
              ]
            }
          }}};

      this.initAppState(idxObj, 'create-form');
      expect(this.appState.shouldReRenderView(transformedResponse)).toBe(false);
    });

  });

  describe('hasMoreThanOneAuthenticatorOption', () => {
    const getAuthenticatorOptionsObj = (response) => {
      const remediationObj = response.remediation.value.find(remediation => remediation.name  === 'select-authenticator-authenticate');
      return remediationObj.value.find(value => value.name === 'authenticator');
    };

    const getAuthenticatorObj = (authenticatorOptionsObj, label) => {
      return authenticatorOptionsObj.options.find(option => option.label === label);
    };

    const getAuthenticatorMethodsObj = (authenticatorObj) => {
      return authenticatorObj.value.form.value.find(value => value.name === 'methodType');
    };

    const changeOVMethodsInAuthenticatorObj = (authenticatorObj, ovMethods) => {
      const methodTypes = getAuthenticatorMethodsObj(authenticatorObj);
      methodTypes.options = methodTypes.options.filter(method => ovMethods.includes(method.value));
    };

    it('returns false if there is only 1 authenticator', (done) => {
      const oktaVerifyChallengResponse = JSON.parse(JSON.stringify(XHRAuthenticatorChallengOktaVerify));
      const authenticatorOptionsObj = getAuthenticatorOptionsObj(oktaVerifyChallengResponse);
      // Replace options with only Password
      authenticatorOptionsObj.options = [ getAuthenticatorObj(authenticatorOptionsObj, 'Okta Password') ];
      expect(authenticatorOptionsObj.options).toHaveLength(1);

      MockUtil.mockIntrospect(done, oktaVerifyChallengResponse, idxResp => {
        this.initAppState({ idx: idxResp }, 'challenge-authenticator');
        expect(this.appState.hasMoreThanOneAuthenticatorOption('select-authenticator-authenticate')).toBe(false);
        done();
      });
    });

    it('returns true if there is more than 1 authenticator', (done) => {
      const oktaVerifyChallengResponse = JSON.parse(JSON.stringify(XHRAuthenticatorChallengOktaVerify));
      const authenticatorOptionsObj = getAuthenticatorOptionsObj(oktaVerifyChallengResponse);
      // Okta Verify and Password are available
      expect(authenticatorOptionsObj.options).toHaveLength(2);

      MockUtil.mockIntrospect(done, oktaVerifyChallengResponse, idxResp => {
        this.initAppState({ idx: idxResp }, 'challenge-authenticator');
        expect(this.appState.hasMoreThanOneAuthenticatorOption('select-authenticator-authenticate')).toBe(true);
        done();
      });
    });

    it('returns true if only Okta Verify authenticator with 3 methods', (done) => {
      const oktaVerifyChallengResponse = JSON.parse(JSON.stringify(XHRAuthenticatorChallengOktaVerify));
      const authenticatorOptionsObj = getAuthenticatorOptionsObj(oktaVerifyChallengResponse);
      // Replace options with only Okta Verify with 3 methods available
      const ovAuthenticatorObj = getAuthenticatorObj(authenticatorOptionsObj, 'Okta Verify');
      authenticatorOptionsObj.options = [ ovAuthenticatorObj ];
      expect(authenticatorOptionsObj.options).toHaveLength(1);
      expect(getAuthenticatorMethodsObj(ovAuthenticatorObj).options).toHaveLength(3);

      MockUtil.mockIntrospect(done, oktaVerifyChallengResponse, idxResp => {
        this.initAppState({ idx: idxResp }, 'challenge-authenticator');
        expect(this.appState.hasMoreThanOneAuthenticatorOption('select-authenticator-authenticate')).toBe(true);
        done();
      });
    });

    it('returns true if only Okta Verify authenticator with 2 methods', (done) => {
      const oktaVerifyChallengResponse = JSON.parse(JSON.stringify(XHRAuthenticatorChallengOktaVerify));
      const authenticatorOptionsObj = getAuthenticatorOptionsObj(oktaVerifyChallengResponse);
      // Replace options with only Okta Verify with 1 method available
      const ovAuthenticatorObj = getAuthenticatorObj(authenticatorOptionsObj, 'Okta Verify');
      changeOVMethodsInAuthenticatorObj(ovAuthenticatorObj, ['totp', 'push']);
      authenticatorOptionsObj.options = [ ovAuthenticatorObj ];
      expect(authenticatorOptionsObj.options).toHaveLength(1);
      expect(getAuthenticatorMethodsObj(ovAuthenticatorObj).options).toHaveLength(2);

      MockUtil.mockIntrospect(done, oktaVerifyChallengResponse, idxResp => {
        this.initAppState({ idx: idxResp }, 'challenge-authenticator');
        expect(this.appState.hasMoreThanOneAuthenticatorOption('select-authenticator-authenticate')).toBe(true);
        done();
      });
    });

    it('returns false if only Okta Verify authenticator with only 1 method (signed_nonce)', (done) => {
      const oktaVerifyChallengResponse = JSON.parse(JSON.stringify(XHRAuthenticatorChallengOktaVerify));
      const authenticatorOptionsObj = getAuthenticatorOptionsObj(oktaVerifyChallengResponse);
      // Replace options with only Okta Verify with 1 method available
      const ovAuthenticatorObj = getAuthenticatorObj(authenticatorOptionsObj, 'Okta Verify');
      changeOVMethodsInAuthenticatorObj(ovAuthenticatorObj, ['signed_nonce']);
      authenticatorOptionsObj.options = [ ovAuthenticatorObj ];
      expect(authenticatorOptionsObj.options).toHaveLength(1);
      expect(getAuthenticatorMethodsObj(ovAuthenticatorObj).options).toHaveLength(1);

      MockUtil.mockIntrospect(done, oktaVerifyChallengResponse, idxResp => {
        this.initAppState({ idx: idxResp }, 'challenge-authenticator');
        expect(this.appState.hasMoreThanOneAuthenticatorOption('select-authenticator-authenticate')).toBe(false);
        done();
      });
    });
  });
});
