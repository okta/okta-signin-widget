import {BaseOktaVerifyChallengeView} from 'v2/view-builder/internals';
import {$} from 'okta';
import AppState from '../../../../../../src/v2/models/AppState';

describe('v2/view-builder/internals/BaseOktaVerifyChallengeView', function() {
  let testContext;
  const testStopPollBindFunc = jest.fn();

  const wait = async (timeout) => {
    await new Promise((resolve) => setTimeout(() => {
      resolve();
    }, timeout));
  };

  const init = () => {
    testContext = {};
    let ExtendedView = BaseOktaVerifyChallengeView.extend({
      getDeviceChallengePayload() {
        return 'mock';
      },
    });
    jest.spyOn(ExtendedView.prototype.stopPolling, 'bind').mockReturnValue(testStopPollBindFunc);

    testContext.view = new ExtendedView({
      appState: new AppState({}, {}),
      model: new AppState({}, {}),
      currentViewState: {},
    });
  };

  it('Should set stopPolling timeout during initialize', async () => {
    const testTimeoutId = 'test_timeout_id';
    jest.spyOn(window, 'setTimeout').mockReturnValue(testTimeoutId);
    init();

    expect(testContext.view.pollingStopTimeout).toBe(testTimeoutId);
    expect(window.setTimeout).toBeCalledTimes(1);
    expect(window.setTimeout).toBeCalledWith(testStopPollBindFunc, 285000);
  });

  it('Should call stopPolling after timeout', () => {
    jest.useFakeTimers();

    init();
    jest.runAllTimers();

    expect(testStopPollBindFunc).toBeCalledTimes(1);

    jest.useRealTimers();
  });

  it('Should clear stopPolling timeout when port is found', async () => {
    const deviceChallenge = {
      domain: 'testDomain',
      ports: [1111]
    };
    jest.spyOn($, 'ajax').mockReturnValue($.Deferred().resolve());
    jest.spyOn(window, 'clearTimeout');

    init();
    testContext.view.doLoopback(deviceChallenge);
    await wait(500);

    expect(clearTimeout).toBeCalledTimes(1);
    expect(clearTimeout).toBeCalledWith(testContext.view.pollingStopTimeout);
  });

});
