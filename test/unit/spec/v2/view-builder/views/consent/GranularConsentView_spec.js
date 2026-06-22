import GranularConsentView from 'v2/view-builder/views/consent/GranularConsentView';
import insertUISchema from 'v2/ion/uiSchemaTransformer';
import xhrConsentGranularPrefixCollision from '../../../../../../../playground/mocks/data/idp/idx/consent-granular-prefix-collision.json';

const buildModel = (mock) => {
  const remediation = mock.remediation.value.find((r) => r.name === 'granular-consent');
  const transformed = { remediations: [{ ...remediation }] };
  insertUISchema({}, transformed);

  // Call createModelClass without constructing the full view (avoids appState dep).
  const ModelClass = GranularConsentView.prototype.createModelClass.call(
    {},
    transformed.remediations[0],
  );
  return new ModelClass({ formName: 'granular-consent' });
};

describe('v2/view-builder/views/consent/GranularConsentView model', function() {
  it('disables Courage flat/unflatten so toJSON keeps dotted scope keys flat', function() {
    const model = buildModel(xhrConsentGranularPrefixCollision);
    model.set('optedScopes.custom1.custom2', false);

    // With flat: false, toJSON does not unflatten — dotted keys remain at top level.
    // The submit path (transformOptedScopes) groups these into a nested optedScopes.
    expect(model.toJSON()).toEqual({
      'optedScopes.openid': true,
      'optedScopes.custom1': true,
      'optedScopes.custom1.custom2': false,
      'optedScopes.profile': true,
    });
  });

  // Customer-reported scenario 1 (PR #4024): plain scope is true → Courage's
  // unflatten threw "Cannot create property 'custom2' on boolean 'true'",
  // blocking BaseView.renderForm at the initial render call site
  // (model.toJSON({verbose: true}) on line 78).
  it('does not crash when toJSON({verbose: true}) runs against a true plain scope colliding with a dotted scope', function() {
    const model = buildModel(xhrConsentGranularPrefixCollision);
    model.set('optedScopes.custom1', true);
    model.set('optedScopes.custom1.custom2', true);

    expect(() => model.toJSON({ verbose: true })).not.toThrow();
  });

  // Customer-reported scenario 2 (PR #4024): plain scope is false → unflatten's
  // `if (!ref[part])` treated false as unset and overwrote it with an empty
  // object, silently dropping the user's "false" choice. Verify the false
  // value is preserved on the flat model.
  it('preserves a false plain scope when a dotted scope shares its prefix', function() {
    const model = buildModel(xhrConsentGranularPrefixCollision);
    model.set('optedScopes.custom1', false);
    model.set('optedScopes.custom1.custom2', true);

    const json = model.toJSON({ verbose: true });
    expect(json['optedScopes.custom1']).toBe(false);
    expect(json['optedScopes.custom1.custom2']).toBe(true);
  });
});
