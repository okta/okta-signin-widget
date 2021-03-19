import idx from '@okta/okta-idx-js';
import 'jasmine-ajax';

const BASE_URL = 'http://localhost:3000';

const mockIntrospect = (done, mockData, assertionFn) => {
  jasmine.Ajax.install();
  jasmine.Ajax.stubRequest(`${BASE_URL}/idp/idx/introspect`).andReturn({
    status: 200,
    responseJSON: mockData,
  });

  const idxStartOpt = {
    domain: BASE_URL,
    stateHandle: '01test-state-token',
    version: '1.0.0',
  };

  idx
    .start(idxStartOpt)
    .then(assertionFn)
    .catch(error => {
      fail(error);
    })
    .finally(() => {
      expect(jasmine.Ajax.requests.count()).toBe(1);
      expect(jasmine.Ajax.requests.at(0).url).toBe(`${BASE_URL}/idp/idx/introspect`);
      jasmine.Ajax.uninstall();
      done();
    });

};

export default {
  mockIntrospect,
};
