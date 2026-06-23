import FormController from 'v2/controllers/FormController';

describe('v2/controllers/FormController', () => {
  describe('handleSwitchForm', () => {
    let appState;
    let beforeHook;
    let afterHook;
    let order;

    beforeEach(() => {
      order = [];
      beforeHook = jest.fn(() => {
        order.push('before');
        return Promise.resolve();
      });
      afterHook = jest.fn(() => {
        order.push('after');
        return Promise.resolve();
      });

      appState = {
        get: jest.fn(() => null),
        unset: jest.fn(),
        set: jest.fn(() => {
          order.push('set:currentFormName');
        }),
        hooks: {
          getHook: jest.fn(() => ({ before: [beforeHook], after: [afterHook] })),
        },
      };
    });

    function callHandler(formName) {
      // Invoke the prototype method directly with a minimal fake `this` —
      // handleSwitchForm only depends on `this.options.appState`, and this
      // avoids spinning up Backbone routing/view machinery.
      return FormController.prototype.handleSwitchForm.call(
        { options: { appState } },
        formName,
      );
    }

    it('runs before/after hooks registered for the target form', async () => {
      await callHandler('select-authenticator-authenticate');

      expect(appState.hooks.getHook).toHaveBeenCalledWith('select-authenticator-authenticate');
      expect(beforeHook).toHaveBeenCalledTimes(1);
      expect(afterHook).toHaveBeenCalledTimes(1);
    });

    it('runs the before hook, then changes currentFormName, then runs the after hook', async () => {
      await callHandler('select-authenticator-authenticate');

      expect(order).toEqual(['before', 'set:currentFormName', 'after']);
      expect(appState.set).toHaveBeenCalledWith('currentFormName', 'select-authenticator-authenticate');
    });

    it('still changes currentFormName when no hook is registered for the target form', async () => {
      appState.hooks.getHook.mockReturnValue(undefined);

      await callHandler('select-authenticator-authenticate');

      expect(appState.set).toHaveBeenCalledWith('currentFormName', 'select-authenticator-authenticate');
      expect(beforeHook).not.toHaveBeenCalled();
      expect(afterHook).not.toHaveBeenCalled();
    });

    it('does not throw when appState has no hooks model', async () => {
      delete appState.hooks;

      await expect(callHandler('select-authenticator-authenticate')).resolves.not.toThrow();
      expect(appState.set).toHaveBeenCalledWith('currentFormName', 'select-authenticator-authenticate');
    });

    it('clears existing messages before switching forms', async () => {
      appState.get.mockImplementation((key) => (key === 'messages' ? [{}] : null));

      await callHandler('select-authenticator-authenticate');

      expect(appState.unset).toHaveBeenCalledWith('messages');
    });
  });
});
