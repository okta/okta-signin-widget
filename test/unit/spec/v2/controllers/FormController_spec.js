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

  describe('handleAfterError', () => {
    function callHandler(formView, order = []) {
      const ctx = {
        formView,
        createAfterEventContext: jest.fn(() => ({ formName: 'identify' })),
        trigger: jest.fn(() => order.push('afterError')),
      };
      FormController.prototype.handleAfterError.call(ctx, { responseJSON: { errorSummary: 'oops' } });
      return ctx;
    }

    it('re-enables form inputs before emitting afterError', () => {
      const order = [];
      const form = { restoreInputsAfterSaving: jest.fn(() => order.push('restore')) };

      const ctx = callHandler({ form }, order);

      expect(order).toEqual(['restore', 'afterError']);
      expect(ctx.trigger).toHaveBeenCalledWith(
        'afterError',
        { formName: 'identify' },
        expect.objectContaining({ errorSummary: 'oops' }),
      );
    });

    it('still emits afterError when the form cannot restore inputs', () => {
      expect(callHandler(undefined).trigger).toHaveBeenCalledWith('afterError', expect.anything(), expect.anything());
      expect(callHandler({ form: {} }).trigger).toHaveBeenCalledWith('afterError', expect.anything(), expect.anything());
    });
  });
});
