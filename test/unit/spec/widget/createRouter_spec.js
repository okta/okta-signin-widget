import createRouter from 'widget/createRouter';

describe('widget/createRouter', () => {
  let MockRouter;
  beforeEach(() => {
    MockRouter = function () {};
    Object.assign(MockRouter.prototype, {
      start: jest.fn()
    });
  });

  it('starts the router', (done) => {
    MockRouter.prototype.start.mockImplementation(() => {
      done();
    });
    createRouter(MockRouter);
  });

  describe('routerOptions', () => {
    it('adds global success and error functions', () => {
      expect(createRouter(MockRouter, {}, {}).routerOptions).toEqual({
        globalSuccessFn: expect.any(Function),
        globalErrorFn: expect.any(Function)
      });
    });

    it('does not modify widgetOptions or renderOptions', () => {
      const widgetOptions = {
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          state: 'widget-state',
          scopes: ['widget', 'scopes']
        }
      };
      const renderOptions = {
        el: 'y',
        authParams: {
          scopes: ['render', 'scopes'],
          state: 'render-state'
        }
      };
      expect(createRouter(MockRouter, widgetOptions, renderOptions).routerOptions).toEqual({
        el: 'y',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          scopes: ['render', 'scopes'],
          state: 'render-state'
        },
        globalSuccessFn: expect.any(Function),
        globalErrorFn: expect.any(Function)
      });
      expect(widgetOptions).toEqual({
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          state: 'widget-state',
          scopes: ['widget', 'scopes']
        }
      });
      expect(renderOptions).toEqual({
        el: 'y',
        authParams: {
          scopes: ['render', 'scopes'],
          state: 'render-state'
        }
      });
    });

    it('renderOptions override widgetOptions', () => {
      const widgetOptions = {
        el: 'x',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          state: 'widget-state',
        }
      };
      const renderOptions = {
        el: 'y',
        authParams: {
          state: 'render-state'
        }
      };

      expect(createRouter(MockRouter, widgetOptions, renderOptions).routerOptions).toEqual({
        el: 'y',
        clientId: 'x',
        redirectUri: 'x',
        authParams: {
          state: 'render-state'
        },
        globalSuccessFn: expect.any(Function),
        globalErrorFn: expect.any(Function)
      });
    });

    describe('authParams', () => {
      it('will use authParams from widgetOptions', () => {
        const widgetOptions = {
          authParams: {
            state: 'widget-state',
            scopes: ['widget', 'scopes']
          }
        };
        expect(createRouter(MockRouter, widgetOptions).routerOptions).toEqual({
          authParams: {
            state: 'widget-state',
            scopes: ['widget', 'scopes']
          },
          globalSuccessFn: expect.any(Function),
          globalErrorFn: expect.any(Function)
        });
      });
  
      it('will use authParams from renderOptions', () => {
        const renderOptions = {
          authParams: {
            scopes: ['render', 'scopes'],
            state: 'render-state'
          }
        };
        expect(createRouter(MockRouter, {}, renderOptions).routerOptions).toEqual({
          authParams: {
            scopes: ['render', 'scopes'],
            state: 'render-state'
          },
          globalSuccessFn: expect.any(Function),
          globalErrorFn: expect.any(Function)
        });
      });
  
      it('authParams are merged from renderOptions into widgetOptions', () => {
        const widgetOptions = {
          el: 'x',
          clientId: 'x',
          redirectUri: 'x',
          authParams: {
            state: 'widget-state',
          }
        };
        const renderOptions = {
          authParams: {
            scopes: ['render', 'scope']
          }
        };
  
        expect(createRouter(MockRouter, widgetOptions, renderOptions).routerOptions).toEqual({
          el: 'x',
          clientId: 'x',
          redirectUri: 'x',
          authParams: {
            scopes: ['render', 'scope'],
            state: 'widget-state'
          },
          globalSuccessFn: expect.any(Function),
          globalErrorFn: expect.any(Function)
        });
      });
    });

    describe('authClient', () => {
      it('sets the authClient on routerOptions', () => {
        const authClient = { foo: 'bar' };
        expect(createRouter(MockRouter, {}, {}, authClient).routerOptions).toEqual({
          authClient,
          globalSuccessFn: expect.any(Function),
          globalErrorFn: expect.any(Function)
        });
      });
    });
  });

  describe('success', () => {
    it('will resolve promise', () => {
      const res = createRouter(MockRouter, {}, {}, null, null, null);
      res.routerOptions.globalSuccessFn(); // will resolve promise, should not throw
      return res.promise;
    });

    it('will call successFn, if provided', () => {
      const successFn = jest.fn();
      const res = createRouter(MockRouter, {}, {}, null, successFn, null);
      res.routerOptions.globalSuccessFn('foo'); // will resolve promise, should not throw
      return res.promise.then(() => {
        expect(successFn).toHaveBeenCalledWith('foo');
      });
    });
  });

  describe('error', () => {
    it('will reject promise', () => {
      const res = createRouter(MockRouter, {}, {}, null, null, null);
      const error = new Error('foo');
      res.routerOptions.globalErrorFn(error); // will reject promise, but should not throw
      return res.promise.catch(e => {
        expect(e).toBe(error);
      });
    });

    it('will call errorFn, if provided', () => {
      const errorFn = jest.fn();
      const res = createRouter(MockRouter, {}, {}, null, null, errorFn);
      const error = new Error('foo');
      res.routerOptions.globalSuccessFn(error); // will resolve promise, should not throw
      return res.promise.catch((e) => {
        expect(e).toBe(error);
        expect(errorFn).toHaveBeenCalledWith(error);
      });
    });
  });
});
