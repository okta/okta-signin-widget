import { Model } from '@okta/courage';
import transformPayload from 'v2/ion/payloadTransformer';

function createGranularConsentModel(scopeValues) {
  const props = {};
  Object.keys(scopeValues).forEach(key => {
    props[key] = { type: 'boolean', value: scopeValues[key] };
  });
  const M = Model.extend({ props });
  return new M();
}

describe('v2/ion/payloadTransformer', function() {
  describe('granular-consent - prefix scope collision', function() {

    it('does not throw when a plain scope is true and a dotted scope shares its prefix', function() {
      const model = createGranularConsentModel({
        'consent': true,
        'optedScopes.custom1': true,
        'optedScopes.custom1.custom2': true,
      });
      expect(() => transformPayload('granular-consent', model)).not.toThrow();
    });

    it('preserves both scopes in the payload when plain scope is true', function() {
      const model = createGranularConsentModel({
        'consent': true,
        'optedScopes.custom1': true,
        'optedScopes.custom1.custom2': true,
      });
      const payload = transformPayload('granular-consent', model);
      expect(payload.optedScopes['custom1']).toBe(true);
      expect(payload.optedScopes['custom1.custom2']).toBe(true);
    });

    it('preserves both scopes in the payload when plain scope is false', function() {
      const model = createGranularConsentModel({
        'consent': true,
        'optedScopes.custom1': false,
        'optedScopes.custom1.custom2': false,
      });
      const payload = transformPayload('granular-consent', model);
      expect(payload.optedScopes['custom1']).toBe(false);
      expect(payload.optedScopes['custom1.custom2']).toBe(false);
    });

  });
});
