import AppState from 'v2/models/AppState';
import MockUtil from '../../../helpers/v2/MockUtil';
import XHRAuthenticatorChallengOktaVerify
  from '../../../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-push.json';
import XHRAuthenticatorEnrollOktaVerify
  from '../../../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-sms.json';
import { FORMS_FOR_VERIFICATION, FORMS_WITHOUT_SIGNOUT } from 'v2/ion/RemediationConstants';
import BrowserFeatures from 'util/BrowserFeatures';

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
      expect(FORMS_FOR_VERIFICATION.length).toEqual(4);
      FORMS_FOR_VERIFICATION.forEach(form => {
        this.initAppState({}, form);
        expect(this.appState.isAuthenticatorChallenge()).toBe(true);
      });
    });
  });

  describe('getSchemaByName', () => {
    it('returns ui schema for a given field', () => {
      jest.spyOn(AppState.prototype, 'getCurrentViewState').mockReturnValue({uiSchema : [{name: 'some-field'}]});
      this.initAppState({}, 'profile-update');
      expect(this.appState.getSchemaByName('some-field')).toEqual({'name': 'some-field'});
    });

    it('returns undefined if given field does not exists', () => {
      jest.spyOn(AppState.prototype, 'getCurrentViewState').mockReturnValue({uiSchema : [{name: 'some-field'}]});
      this.initAppState({}, 'profile-update');
      expect(this.appState.getSchemaByName('field')).toBeUndefined();
    });
  });

  describe('hasActionObject', () => {
    it('returns true if given action object exists', () => {
      this.initAppState({ idx: { actions: { cancel: () => {} } } });
      expect(this.appState.hasActionObject('cancel')).toBe(true);
    });

    it('returns false if given action object does not exists', () => {
      this.initAppState();
      expect(this.appState.hasActionObject('cancel')).toBe(false);
    });
  });

  describe('shouldReRenderView', () => {
    it('rerender view should be false if stateHandle are different', () => {

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
          }}, 
        'remediations': [{
          'name': 'create-form',
          'refresh': 2000,
        }]};

      const transformedResponse = JSON.parse(JSON.stringify(idxObj));
      transformedResponse.idx.rawIdxState.stateHandle = '1234';

      this.initAppState(idxObj, 'create-form');
      expect(this.appState.shouldReRenderView(transformedResponse)).toBe(false);
    });

  });

  describe('hasRemediationObject', () => {
    it('returns null if the form is not present', (done) => {
      const oktaVerifyChallengResponse = JSON.parse(JSON.stringify(XHRAuthenticatorChallengOktaVerify));
      MockUtil.mockIntrospect(done, oktaVerifyChallengResponse, idxResp => {
        this.initAppState({ idx: idxResp }, 'challenge-authenticator');
        expect(this.appState.hasRemediationObject('other-form')).toBeUndefined();
        done();
      });
    });

    it('returns the remediation object if the form is present (select-authenticator-enroll)', (done) => {
      const oktaVerifyEnrollResponse = JSON.parse(JSON.stringify(XHRAuthenticatorEnrollOktaVerify));
      MockUtil.mockIntrospect(done, oktaVerifyEnrollResponse, idxResp => {
        this.initAppState({ idx: idxResp }, 'enroll-authenticator');
        expect(this.appState.hasRemediationObject('select-authenticator-enroll')).toBeDefined();
        done();
      });
    });

    it('returns the remediation object if the form is present (select-authenticator-authenticate)', (done) => {
      const oktaVerifyChallengResponse = JSON.parse(JSON.stringify(XHRAuthenticatorChallengOktaVerify));
      MockUtil.mockIntrospect(done, oktaVerifyChallengResponse, idxResp => {
        this.initAppState({ idx: idxResp }, 'challenge-authenticator');
        expect(this.appState.hasRemediationObject('select-authenticator-authenticate')).toBeDefined();
        done();
      });
    });
  });

  describe('getRemediationAuthenticationOptions', () => {
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

    it('returns array size 1 if response has only 1 authenticator', (done) => {
      const oktaVerifyChallengResponse = JSON.parse(JSON.stringify(XHRAuthenticatorChallengOktaVerify));
      const authenticatorOptionsObj = getAuthenticatorOptionsObj(oktaVerifyChallengResponse);
      // Replace options with only Password
      authenticatorOptionsObj.options = [ getAuthenticatorObj(authenticatorOptionsObj, 'Okta Password') ];
      expect(authenticatorOptionsObj.options.length).toEqual(1);

      MockUtil.mockIntrospect(done, oktaVerifyChallengResponse, idxResp => {
        this.initAppState({ idx: idxResp }, 'challenge-authenticator');
        const options = this.appState.getRemediationAuthenticationOptions('select-authenticator-authenticate');
        expect(options.length).toEqual(1);
        expect(options[0].label).toBe('Okta Password');
        done();
      });
    });

    it('returns array size 4 if response has Okta Verify (all methods) and password', (done) => {
      const oktaVerifyChallengResponse = JSON.parse(JSON.stringify(XHRAuthenticatorChallengOktaVerify));
      const authenticatorOptionsObj = getAuthenticatorOptionsObj(oktaVerifyChallengResponse);
      // Okta Verify and Password are available
      expect(authenticatorOptionsObj.options.length).toEqual(2);

      MockUtil.mockIntrospect(done, oktaVerifyChallengResponse, idxResp => {
        this.initAppState({ idx: idxResp }, 'challenge-authenticator');
        const options = this.appState.getRemediationAuthenticationOptions('select-authenticator-authenticate');
        expect(options.length).toEqual(4);
        expect(options[0].label).toBe('Get a push notification');
        expect(options[1].label).toBe('Enter a code');
        expect(options[2].label).toBe('Okta Password');
        expect(options[3].label).toBe('Use Okta FastPass');
        done();
      });
    });

    it('returns array size 3 if response has Okta Verify with all methods', (done) => {
      const oktaVerifyChallengResponse = JSON.parse(JSON.stringify(XHRAuthenticatorChallengOktaVerify));
      const authenticatorOptionsObj = getAuthenticatorOptionsObj(oktaVerifyChallengResponse);
      // Replace options with only Okta Verify with 3 methods available
      const ovAuthenticatorObj = getAuthenticatorObj(authenticatorOptionsObj, 'Okta Verify');
      authenticatorOptionsObj.options = [ ovAuthenticatorObj ];
      expect(authenticatorOptionsObj.options.length).toEqual(1);
      expect(getAuthenticatorMethodsObj(ovAuthenticatorObj).options.length).toEqual(3);

      MockUtil.mockIntrospect(done, oktaVerifyChallengResponse, idxResp => {
        this.initAppState({ idx: idxResp }, 'challenge-authenticator');
        const options = this.appState.getRemediationAuthenticationOptions('select-authenticator-authenticate');
        expect(options.length).toEqual(3);
        expect(options[0].label).toBe('Get a push notification');
        expect(options[1].label).toBe('Enter a code');
        expect(options[2].label).toBe('Use Okta FastPass');
        done();
      });
    });

    it('returns array size 2 if response has Okta Verify with 2 methods', (done) => {
      const oktaVerifyChallengResponse = JSON.parse(JSON.stringify(XHRAuthenticatorChallengOktaVerify));
      const authenticatorOptionsObj = getAuthenticatorOptionsObj(oktaVerifyChallengResponse);
      // Replace options with only Okta Verify with 1 method available
      const ovAuthenticatorObj = getAuthenticatorObj(authenticatorOptionsObj, 'Okta Verify');
      changeOVMethodsInAuthenticatorObj(ovAuthenticatorObj, ['totp', 'push']);
      authenticatorOptionsObj.options = [ ovAuthenticatorObj ];
      expect(authenticatorOptionsObj.options.length).toEqual(1);
      expect(getAuthenticatorMethodsObj(ovAuthenticatorObj).options.length).toEqual(2);

      MockUtil.mockIntrospect(done, oktaVerifyChallengResponse, idxResp => {
        this.initAppState({ idx: idxResp }, 'challenge-authenticator');
        const options = this.appState.getRemediationAuthenticationOptions('select-authenticator-authenticate');
        expect(options.length).toEqual(2);
        expect(options[0].label).toBe('Get a push notification');
        expect(options[1].label).toBe('Enter a code');
        done();
      });
    });

    it('returns array size 1 if response has Okta Verify with only 1 method (signed_nonce)', (done) => {
      const oktaVerifyChallengResponse = JSON.parse(JSON.stringify(XHRAuthenticatorChallengOktaVerify));
      const authenticatorOptionsObj = getAuthenticatorOptionsObj(oktaVerifyChallengResponse);
      // Replace options with only Okta Verify with 1 method available
      const ovAuthenticatorObj = getAuthenticatorObj(authenticatorOptionsObj, 'Okta Verify');
      changeOVMethodsInAuthenticatorObj(ovAuthenticatorObj, ['signed_nonce']);
      authenticatorOptionsObj.options = [ ovAuthenticatorObj ];
      expect(authenticatorOptionsObj.options.length).toEqual(1);
      expect(getAuthenticatorMethodsObj(ovAuthenticatorObj).options.length).toEqual(1);

      MockUtil.mockIntrospect(done, oktaVerifyChallengResponse, idxResp => {
        this.initAppState({ idx: idxResp }, 'challenge-authenticator');
        const options = this.appState.getRemediationAuthenticationOptions('select-authenticator-authenticate');
        expect(options.length).toEqual(1);
        expect(options[0].label).toBe('Use Okta FastPass');
        done();
      });
    });
  });

  describe('getUser', () => {
    it('returns the "user" object', () => {
      const user = { identifier: 'nobody@nowhere', firstName: 'fake', lastName: 'also-fake' };
      this.initAppState({ user });
      expect(this.appState.getUser()).toBe(user);
    });
  });

  describe('chooseRemediation', () => {

    it('Returns undefined if response does not contain remediations', () => {
      this.initAppState();
      expect(this.appState.chooseRemediation({})).toBe(undefined);
    });

    it('By default, returns the first remediation', () => {
      this.initAppState();
      const remediations = [{ name: 'a' }, { name: 'b' }];
      const transformedResponse = {
        remediations
      };
      expect(this.appState.chooseRemediation(transformedResponse)).toEqual({ name: 'a' });
    });

    it('Special case: Okta Verify enrollment: Returns select-enrollment-channel on mobile', () => {
      spyOn(BrowserFeatures, 'isIOS').and.callFake(() => true);
      spyOn(BrowserFeatures, 'isAndroid').and.callFake(() => false);
      const remediations = [{ name: 'enroll-poll' }, { name: 'select-enrollment-channel' }];
      const transformedResponse = {
        remediations,
        currentAuthenticator: {
          key: 'okta_verify',
          contextualData: {
            selectedChannel: 'qrcode'
          }
        }
      };
      this.initAppState(transformedResponse);
      expect(this.appState.chooseRemediation(transformedResponse)).toEqual({ name: 'select-enrollment-channel' });
    });

  });
});
