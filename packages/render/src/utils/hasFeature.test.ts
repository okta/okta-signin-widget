import { hasFeature } from './hasFeature';

describe('hasFeature', () => {
  test('returns true when feature flag exists and has boolean value true', () => {
    const featureFlags = ['mockFF'];
    expect(hasFeature('mockFF', featureFlags)).toBe(true);
  });

  test('returns false when feature flag not exists', () => {
    const featureFlags = ['mockFF'];
    expect(hasFeature('mockFFNew', featureFlags)).toBe(false);
  });

});
