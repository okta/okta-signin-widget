import idx from 'idx';

const BASE_URL = 'http://localhost:3000';

const mockIntrospect = (done, mockData, assertionFn) => {
  jasmine.Ajax.install();
  jasmine.Ajax.stubRequest(
    `${BASE_URL}/idp/idx/introspect`
  ).andReturn({
    status: 200,
    responseJSON: mockData,
  });

  const idxStartOpt = {
    domain: BASE_URL,
    stateHandle: '01test-state-token',
    version: '1.0.0'
  };

  idx.start(idxStartOpt)
    .then(assertionFn)
    .catch((error)=>{
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
