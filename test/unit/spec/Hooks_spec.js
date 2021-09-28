import Hooks from 'models/Hooks';
import { mergeHook, executeHookFunctions, executeHooksBefore, executeHooksAfter } from 'util/Hooks';

describe('Hooks', () => {
  let testContext;
  
  beforeEach(() => {
    testContext = {};
  });

  function createDummyHook(callback, failWithError) {
    // Hook functions receive no parameters. They may return a promise but the value is not used.
    return jest.fn().mockImplementation(() => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          callback();
          failWithError ? reject(failWithError) : resolve();
        }, 1);
      });
    });
  }

  function flushPromises() {
    return new Promise(res => process.nextTick(res));
  }

  describe('Hooks model', () => {
    beforeEach(() => {
      const hooks = new Hooks();
      testContext = {
        hooks
      };
    });

    describe('mergeHook', () => {
      it('will set "hooks" data', () => {
        expect(testContext.hooks.get('hooks')).toBeUndefined();
        const mockHook = { before: [jest.fn()], after: [jest.fn()] };
        testContext.hooks.mergeHook('some-form', mockHook);
        expect(testContext.hooks.get('hooks')).toEqual({
          'some-form': mockHook
        });
      });
    });
  
    describe('getHook', () => {
      it('returns undefined by default', () => {
        expect(testContext.hooks.get('hooks')).toBeUndefined();
        expect(testContext.hooks.getHook('some-form')).toBeUndefined();
      });
      it('returns undefined if a hook has not been set for a given formName', () => {
        const mockHook = { before: [jest.fn()], after: [jest.fn()] };
        testContext.hooks.set('hooks', {
          'some-form': mockHook
        });
        expect(testContext.hooks.getHook('another-form')).toBeUndefined();
      });
      it('returns a value if it exists', () => {
        const mockHook = { before: [jest.fn()], after: [jest.fn()] };
        testContext.hooks.set('hooks', {
          'some-form': mockHook
        });
        expect(testContext.hooks.getHook('some-form')).toEqual(mockHook);
      });
    });
  });

  describe('Hooks util', () => {
    beforeEach(() => {
      const hooks = {};
      const beforeFn = jest.fn();
      const afterFn = jest.fn();
      const mockHook = { before: [beforeFn], after: [afterFn] };
      testContext = {
        hooks,
        beforeFn,
        afterFn,
        mockHook
      };
      jest.useRealTimers();
    });
    describe('mergeHook', () => {
      it('adds the hook if it does not already exist', () => {
        const { hooks, mockHook, beforeFn, afterFn } = testContext;
        mergeHook(hooks, 'some-form', mockHook);
        expect(hooks['some-form']).toEqual(mockHook);
        expect(hooks['some-form'].before[0]).toBe(beforeFn);
        expect(hooks['some-form'].after[0]).toBe(afterFn);
      });
      it('concats before and after arrays for an existing hook', () => {
        const { hooks, mockHook, beforeFn, afterFn } = testContext;
        const existingBefore = jest.fn();
        const existingAfter = jest.fn();
        hooks['some-form'] = {
          before: [existingBefore],
          after: [existingAfter]
        };
        mergeHook(hooks, 'some-form', mockHook);
        expect(hooks['some-form'].before[0]).toBe(existingBefore);
        expect(hooks['some-form'].after[0]).toBe(existingAfter);
        expect(hooks['some-form'].before[1]).toBe(beforeFn);
        expect(hooks['some-form'].after[1]).toBe(afterFn);
      });
    });

    describe('executeHookFunctions', () => {
      it('executes functions in order', async () => {
        jest.useFakeTimers();
        const callback1 = jest.fn();
        const fn1 = createDummyHook(callback1);
        const callback2 = jest.fn();
        const fn2 = createDummyHook(callback2);
        executeHookFunctions([fn1, fn2]);
        expect(fn1).toHaveBeenCalled();
        expect(callback1).not.toHaveBeenCalled();
        expect(fn2).not.toHaveBeenCalled();
        jest.runAllTimers();
        expect(callback1).toHaveBeenCalled();
        expect(fn2).not.toHaveBeenCalled();
        await flushPromises();
        expect(fn2).toHaveBeenCalled();
        expect(callback2).not.toHaveBeenCalled();
        jest.runAllTimers();
        expect(callback2).toHaveBeenCalled();
      });
      it('does not catch exceptions thrown from async functions', async () => {
        const error = new Error('mock error');
        const callback1 = jest.fn();
        const fn1 = createDummyHook(callback1, error);
        const callback2 = jest.fn();
        const fn2 = createDummyHook(callback2);
        let errorThrown = false;
        try {
          await executeHookFunctions([fn1, fn2]);
        } catch (e) {
          expect(e).toBe(error);
          errorThrown = true;
        }
        expect(errorThrown).toBe(true);
        expect(fn1).toHaveBeenCalled();
        expect(callback1).toHaveBeenCalled();
        expect(fn2).not.toHaveBeenCalled();
      });
    });

    describe('executeHooksBefore', () => {
      it('does not throw if no hook was passed', () => {
        expect(executeHooksBefore).not.toThrow();
      });
      it('does not throw if a hook with no before section was passed', () => {
        expect(executeHooksBefore.bind(null, {})).not.toThrow();
      });
      it('executes before functions in order', async () => {
        jest.useFakeTimers();
        const callback1 = jest.fn();
        const fn1 = createDummyHook(callback1);
        const callback2 = jest.fn();
        const fn2 = createDummyHook(callback2);
        const hook = { before: [fn1, fn2] };
        executeHooksBefore(hook);
        expect(fn1).toHaveBeenCalled();
        expect(callback1).not.toHaveBeenCalled();
        expect(fn2).not.toHaveBeenCalled();
        jest.runAllTimers();
        expect(callback1).toHaveBeenCalled();
        expect(fn2).not.toHaveBeenCalled();
        await flushPromises();
        expect(fn2).toHaveBeenCalled();
        expect(callback2).not.toHaveBeenCalled();
        jest.runAllTimers();
        expect(callback2).toHaveBeenCalled();
      });
    });

    describe('executeHooksAfter', () => {
      it('does not throw if no hook was passed', () => {
        expect(executeHooksAfter).not.toThrow();
      });
      it('does not throw if a hook with no before section was passed', () => {
        expect(executeHooksAfter.bind(null, {})).not.toThrow();
      });
      it('executes after functions in order', async () => {
        jest.useFakeTimers();
        const callback1 = jest.fn();
        const fn1 = createDummyHook(callback1);
        const callback2 = jest.fn();
        const fn2 = createDummyHook(callback2);
        const hook = { after: [fn1, fn2] };
        executeHooksAfter(hook);
        expect(fn1).toHaveBeenCalled();
        expect(callback1).not.toHaveBeenCalled();
        expect(fn2).not.toHaveBeenCalled();
        jest.runAllTimers();
        expect(callback1).toHaveBeenCalled();
        expect(fn2).not.toHaveBeenCalled();
        await flushPromises();
        expect(fn2).toHaveBeenCalled();
        expect(callback2).not.toHaveBeenCalled();
        jest.runAllTimers();
        expect(callback2).toHaveBeenCalled();
      });
    });
  });
});
