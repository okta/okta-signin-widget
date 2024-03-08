import {
  serializeValue,
  toPlain,
} from '../../../../../src/plugins/OktaPluginDebugger/utils';

describe('OktaPluginDebugger/utils', () => {
  describe('toPlain()', () => {
    it('handles Error object', () => {
      const err = new Error('My Error');
      const res = toPlain(err);
      expect(res).toMatchObject({
        _class: 'Error',
        message: 'My Error',
        name: 'Error',
      });
      expect(res.stack).toBeDefined();
    });

    it('handles CustomEvent object', () => {
      const evt = new CustomEvent('okta-i18n-error', {
        detail: {
          type: 'l10n-error',
          key: 'some-i18n-key',
          reason: 'Not found'
        }
      });
      const res = toPlain(evt);
      expect(res).toMatchObject({
        _class: 'CustomEvent',
        detail: {
          type: 'l10n-error',
          key: 'some-i18n-key',
          reason: 'Not found'
        },
        isTrusted: false
      });
    });

    it('handles circular structure', () => {
      const a: Record<string, unknown> = {
        prop: 123,
      };
      a.a = a;
      const res = toPlain(a);
      expect(res).toMatchObject({
        prop: 123,
        a: '[ref $]'
      });
    });
  });

  describe('serializeValue()', () => {
    it('returns string as-is', () => {
      expect(serializeValue('abc')).toEqual('abc');
    });

    it('transforms object to a plain object and calls JSON.stringify()', () => {
      expect(serializeValue({a: 1})).toEqual('{\n  "a": 1\n}');
    });
  });
});
