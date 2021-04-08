import AppState from 'v2/models/AppState';
import {FORMS, FORMS_FOR_VERIFICATION, FORMS_WITHOUT_SIGNOUT} from 'v2/ion/RemediationConstants';

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
    it('returns false if the currentFormName is in FORMS_WITHOUT_SIGNOUT', () => {
      this.initAppState({ idx: { actions: { cancel: () => {} } } }, FORMS_WITHOUT_SIGNOUT[0]);
      expect(this.appState.shouldShowSignOutLinkInCurrentForm()).toBe(false);
    });
    it('returns false if param hideSignOutLinkInMFA is true currentFormName is part of FORMS_FOR_VERIFICATION', () => {
      this.initAppState({ idx: { actions: { cancel: () => {} } } }, FORMS_FOR_VERIFICATION[0]);
      expect(this.appState.shouldShowSignOutLinkInCurrentForm(true)).toBe(false);
    });
    it('returns true if all conditions are met', () => {
      this.initAppState({ idx: { actions: { cancel: () => {} } } }, FORMS_FOR_VERIFICATION[0]);
      expect(this.appState.shouldShowSignOutLinkInCurrentForm()).toBe(true);
    });
    it('returns true if param hideSignOutLinkInMFA is true but currentFormName is not part of FORMS_FOR_VERIFICATION', () => {
      this.initAppState({ idx: { actions: { cancel: () => {} } } }, FORMS.DEVICE_CHALLENGE_POLL);
      expect(this.appState.shouldShowSignOutLinkInCurrentForm(true)).toBe(true);
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
});
