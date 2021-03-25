import {Model} from 'okta';

import Settings from 'models/Settings';

import AppState from 'v2/models/AppState';

import FormController from 'v2/controllers/FormController';

describe('v2/controllers/FormController', function() {
  let testContext;
  beforeEach(function() {
    testContext = {};
    testContext.init = (settings) => {
      const appState = new AppState({idx: {neededToProceed: []}});
      appState.hasRemediationObject = jest.fn();
      appState.get('idx').neededToProceed.find = jest.fn().mockImplementation(() => true);
      appState.get('idx').proceed = jest.fn().mockImplementation(() => ({then: () => Promise.resolve()}));
      testContext.controller = new FormController({appState, settings});
      testContext.model = new Model({formName: 'identify'});
    };
  });

  afterEach(function() {
    testContext.controller.options.appState.get('idx').proceed.mockReset();
  });

  it('passes identifier to idx.proceed', function() {
    const settings = new Settings({
      baseUrl: 'http://localhost:3000',
    });
    testContext.init(settings);

    testContext.model.set('identifier', 'foo');
    testContext.controller.handleSaveForm(testContext.model);

    expect(testContext.controller.options.appState.get('idx').proceed.mock.calls[0][1].identifier).toEqual('foo');
  });

  it('passes transformed identifier using settings.transformUsername to idx.proceed', function() {
    const settings = new Settings({
      baseUrl: 'http://localhost:3000',
      transformUsername: function(username, operation) {
        if (operation === 'PRIMARY_AUTH') {
          return `${username}@okta.com`;
        }
      }
    });
    testContext.init(settings);

    testContext.model.set('identifier', 'foo');
    testContext.controller.handleSaveForm(testContext.model);

    expect(testContext.controller.options.appState.get('idx').proceed.mock.calls[0][1].identifier).toEqual('foo@okta.com');
  });
});
