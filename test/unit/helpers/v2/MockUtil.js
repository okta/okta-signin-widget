import Util from 'util/Util';
const BASE_URL = 'http://localhost:3000';

const mockIntrospect = (done, mockData, assertionFn) => {
  jasmine.Ajax.install();
  jasmine.Ajax.stubRequest(
    `${BASE_URL}/idp/idx/introspect`
  ).andReturn({
    status: 200,
    responseJSON: mockData,
  });

  Util.introspectToken(null, {
    baseUrl: BASE_URL,
    stateToken: '01test-state-token',
    apiVersion: '1.0.0'
  })
    .then(assertionFn)
    .catch((error)=>{
      fail(error);
    })
    .done(() => {
      jasmine.Ajax.uninstall();
      done();
    });

  expect(jasmine.Ajax.requests.count()).toBe(1);
  expect(jasmine.Ajax.requests.at(0).url).toBe(`${BASE_URL}/idp/idx/introspect`);
};

export default {
  mockIntrospect,
};
