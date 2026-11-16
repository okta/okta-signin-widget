import FormController from 'v2/controllers/FormController';

// Stub module-level deps that handleSaveForm pulls in so we can exercise the
// prototype method with a minimal fake `this` (no Backbone/view machinery).
jest.mock('v2/ion/payloadTransformer', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));
jest.mock('util/CookieUtil', () => ({
  __esModule: true,
  default: { setUsernameCookie: jest.fn(), removeUsernameCookie: jest.fn() },
}));

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

  // OKTA-1152243 / OKTA-1272313: the widget resets a pinned auth-js flow to 'default'
  // (and persists it to the saved transaction meta) at reset-authenticator for resetPassword
  // and at enroll-profile for signup, so post-auth keep-me-signed-in — which is not part of
  // PasswordRecoveryFlow / RegistrationFlow — does not make auth-js throw
  // "No remediation can match current flow".
  describe('handleSaveForm resets pinned flow for post-auth KMSI', () => {
    let idx;
    let authClient;
    let savedMeta;

    function runSaveForm(formName, flow) {
      savedMeta = { flow, interactionHandle: 'abc' };
      idx = {
        getFlow: jest.fn(() => flow),
        setFlow: jest.fn(),
        getSavedTransactionMeta: jest.fn(() => savedMeta),
        saveTransactionMeta: jest.fn(),
        // reject to short-circuit right after the flow-reset block; the rejection
        // is swallowed by handleSaveForm's try/catch -> showFormErrors (stubbed).
        proceed: jest.fn(() => Promise.reject(new Error('stop-after-reset'))),
      };
      authClient = { idx };

      const settings = {
        get: jest.fn(() => false),
        getAuthClient: jest.fn(() => authClient),
        transformUsername: jest.fn((u) => u),
      };
      const appState = {
        hasRemediationObject: jest.fn(() => true),
        get: jest.fn((key) => (key === 'idx' ? { context: { stateHandle: 'x' } } : null)),
      };
      const model = {
        get: jest.fn((key) => (key === 'formName' ? formName : undefined)),
        trigger: jest.fn(),
      };

      const fakeThis = {
        options: { settings, appState },
        settings,
        formView: { model, form: {} },
        toggleFormButtonState: jest.fn(),
        transformIdentifier: jest.fn((_formName, payload) => payload),
        showFormErrors: jest.fn(() => Promise.resolve()),
        handleIdxResponse: jest.fn(() => Promise.resolve()),
      };

      return FormController.prototype.handleSaveForm.call(fakeThis, model);
    }

    it('resets to default flow at reset-authenticator during resetPassword', async () => {
      await runSaveForm('reset-authenticator', 'resetPassword');

      expect(idx.setFlow).toHaveBeenCalledWith('default');
      expect(idx.saveTransactionMeta).toHaveBeenCalledWith(
        expect.objectContaining({ flow: 'default' }),
      );
      // the proceed call also carries flow: 'default'
      expect(idx.proceed).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'reset-authenticator', flow: 'default' }),
      );
    });

    it('resets to default flow at enroll-profile during signup', async () => {
      await runSaveForm('enroll-profile', 'signup');

      expect(idx.setFlow).toHaveBeenCalledWith('default');
      expect(idx.saveTransactionMeta).toHaveBeenCalledWith(
        expect.objectContaining({ flow: 'default' }),
      );
      expect(idx.proceed).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'enroll-profile', flow: 'default' }),
      );
    });

    it('resets to default flow at enroll-profile during register', async () => {
      await runSaveForm('enroll-profile', 'register');

      expect(idx.setFlow).toHaveBeenCalledWith('default');
      expect(idx.saveTransactionMeta).toHaveBeenCalledWith(
        expect.objectContaining({ flow: 'default' }),
      );
    });

    it('does NOT reset the flow for enroll-profile outside signup/register', async () => {
      await runSaveForm('enroll-profile', 'default');

      expect(idx.setFlow).not.toHaveBeenCalled();
      expect(idx.saveTransactionMeta).not.toHaveBeenCalled();
      expect(idx.proceed).toHaveBeenCalledWith(
        expect.not.objectContaining({ flow: 'default' }),
      );
    });

    it('does NOT reset the flow for a later registration step in signup', async () => {
      await runSaveForm('enroll-authenticator', 'signup');

      expect(idx.setFlow).not.toHaveBeenCalled();
      expect(idx.saveTransactionMeta).not.toHaveBeenCalled();
    });
  });
});
