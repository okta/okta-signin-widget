import { Model } from '@okta/courage';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';

import DeviceChallengePollView from 'v2/view-builder/views/device/DeviceChallengePollView';

import identifyWithDeviceProbingLoopback from '../../../../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback';


describe('v2/view-builder/views/device/DeviceChallengePollView', () => {
  let settings = new Settings({ 
    baseUrl: 'http://localhost:3000'
  });

  const setup = () => {
    const appState = new AppState({}, {});
    const view = new DeviceChallengePollView({
      appState,
      settings,
      currentViewState: {},
      model: new Model(),
    });
    view.render();
    return view;
  };

  afterEach(function() {
    jest.resetAllMocks();
  });

  it('next poll should not start if previous is failed', () => {
    
  });

});