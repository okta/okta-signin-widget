import { OktaAuth } from '@okta/okta-auth-js';
import 'jasmine-ajax';

const BASE_URL = 'http://localhost:3000';

const mockIntrospect = (done, mockData, assertionFn) => {
  jasmine.Ajax.install();
  jasmine.Ajax.stubRequest(`${BASE_URL}/idp/idx/introspect`).andReturn({
    status: 200,
    responseJSON: mockData,
  });

  const introspectOptions = {
    stateHandle: '01test-state-token'
  };

  const authClient = new OktaAuth({
    issuer: BASE_URL
  });

  authClient.idx.introspect(introspectOptions)
    .then(assertionFn)
    .catch(error => {
      fail(error);
    })
    .finally(() => {
      jasmine.Ajax.uninstall();
      done();
    });

  expect(jasmine.Ajax.requests.count()).toBe(1);
  expect(jasmine.Ajax.requests.at(0).url).toBe(`${BASE_URL}/idp/idx/introspect`);
};

export default {
  mockIntrospect,
};
