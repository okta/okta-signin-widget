import polling from '../../../../../../../src/v2/view-builder/views/shared/polling';
import AppState from '../../../../../../../src/v2/models/AppState';

describe('v2/view-builder/views/polling', function() {
  let testContext;

  const init = () => {
    testContext = {};
    testContext.pollingTestObj = {};
    Object.assign(testContext.pollingTestObj, polling);

    testContext.pollingTestObj.options = {};
    testContext.pollingTestObj.options.appState = new AppState({}, {});
    testContext.appState = testContext.pollingTestObj.options.appState;
    testContext.pollingTestObj.model = {};
  };

  const wait = async (timeout) => {
    await new Promise((resolve) => setTimeout( () => {
      resolve();
    }, timeout));
  };

  beforeEach(() => {
    init();
  });

  it('_startRemediationPolling makes only one poll call with timeout', async () => {
    testContext.pollingTestObj.fixedPollingInterval = 100;
    spyOn(testContext.appState, 'trigger');

    testContext.pollingTestObj._startRemediationPolling();
    await wait(1_000);

    expect(testContext.appState.trigger).toHaveBeenCalledTimes(1);
    expect(testContext.appState.trigger).toHaveBeenCalledWith('saveForm', testContext.pollingTestObj.model);
  });

  it('stopPolling should prevent _startRemediationPolling from making poll call', async () => {
    testContext.pollingTestObj.fixedPollingInterval = 500;
    spyOn(testContext.appState, 'trigger');

    testContext.pollingTestObj._startRemediationPolling();
    testContext.pollingTestObj.stopPolling();
    await wait(1_000);

    expect(testContext.appState.trigger).not.toHaveBeenCalled();
  });


  it('_startAuthenticatorPolling makes only one poll call with timeout', async () => {
    testContext.pollingTestObj.dynamicPollingInterval = 100;
    const respKey = 'currentAuthenticator';
    spyOn(testContext.appState, 'has').and.callFake(responseKey => responseKey === respKey);
    spyOn(testContext.appState, 'trigger');

    testContext.pollingTestObj._startAuthenticatorPolling();
    await wait(1_000);

    expect(testContext.appState.trigger).toHaveBeenCalledTimes(1);
    expect(testContext.appState.trigger).toHaveBeenCalledWith('invokeAction', `${respKey}-poll`);
  });

  it('stopPolling should prevent _startAuthenticatorPolling from making poll call', async () => {
    testContext.pollingTestObj.dynamicPollingInterval = 500;
    const respKey = 'currentAuthenticator';
    spyOn(testContext.appState, 'has').and.callFake(responseKey => responseKey === respKey);
    spyOn(testContext.appState, 'trigger');

    testContext.pollingTestObj._startAuthenticatorPolling();
    testContext.pollingTestObj.stopPolling();
    await wait(1_000);

    expect(testContext.appState.trigger).not.toHaveBeenCalled();
  });

});
