import transformPayload from 'v2/ion/payloadTransformer';
import { FORMS as RemediationForms } from 'v2/ion/RemediationConstants';

const buildModel = (json) => ({
  toJSON: jest.fn(() => ({ ...json })),
});

describe('v2/ion/payloadTransformer', function() {
  describe('forms without a registered transformer', function() {
    it('returns model.toJSON() unchanged', function() {
      const model = buildModel({ identifier: 'user@example.com' });
      const result = transformPayload('identify', model);

      expect(model.toJSON).toHaveBeenCalled();
      expect(result).toEqual({ identifier: 'user@example.com' });
    });
  });

  describe('consent-granular', function() {
    it('groups optedScopes.* keys into a nested optedScopes object', function() {
      const model = buildModel({
        consent: true,
        'optedScopes.openid': true,
        'optedScopes.email': false,
      });

      const result = transformPayload(RemediationForms.CONSENT_GRANULAR, model);

      expect(result).toEqual({
        consent: true,
        optedScopes: {
          openid: true,
          email: false,
        },
      });
    });

    it('preserves dotted scope names without further nesting them', function() {
      const model = buildModel({
        consent: true,
        'optedScopes.custom3.custom4.custom5': true,
      });

      const result = transformPayload(RemediationForms.CONSENT_GRANULAR, model);

      expect(result.optedScopes).toEqual({
        'custom3.custom4.custom5': true,
      });
    });

    // Customer scenario 1 (PR #4024): plain scope is `true` — used to throw
    // "Cannot create property 'custom2' on boolean 'true'" out of unflatten.
    it('does not throw or drop scopes when a plain scope shares a prefix with a dotted scope (true case)', function() {
      const model = buildModel({
        consent: true,
        'optedScopes.custom1': true,
        'optedScopes.custom1.custom2': false,
      });

      const result = transformPayload(RemediationForms.CONSENT_GRANULAR, model);

      expect(result).toEqual({
        consent: true,
        optedScopes: {
          custom1: true,
          'custom1.custom2': false,
        },
      });
    });

    // Customer scenario 2 (PR #4024): plain scope is `false` — used to be silently
    // overwritten with an empty object by unflatten's `if (!ref[part])` check.
    it('does not throw or drop scopes when a plain scope shares a prefix with a dotted scope (false case)', function() {
      const model = buildModel({
        consent: true,
        'optedScopes.custom1': false,
        'optedScopes.custom1.custom2': false,
      });

      const result = transformPayload(RemediationForms.CONSENT_GRANULAR, model);

      expect(result).toEqual({
        consent: true,
        optedScopes: {
          custom1: false,
          'custom1.custom2': false,
        },
      });
    });

    it('returns an empty optedScopes object when no opted scope keys are present', function() {
      const model = buildModel({ consent: true });

      const result = transformPayload(RemediationForms.CONSENT_GRANULAR, model);

      expect(result).toEqual({
        consent: true,
        optedScopes: {},
      });
    });
  });
});
