import { hasAnyFeature } from './hasAnyFeature';

describe('hasAnyFeature', () => {
  it('returns true when one of the feature is in feature flags', () => {
    const featureFlags = ['mockFF1', 'mockFF2'];
    expect(hasAnyFeature(['mockFF1'], featureFlags)).toBe(true);
  });

  it('returns true when there is overlap with feature flags', () => {
    const featureFlags = ['mockFF1', 'mockFF2'];
    expect(hasAnyFeature(['mockFF1', 'mockFF3'], featureFlags)).toBe(true);
  });

  it('returns false when nothing exists in feature flags', () => {
    const featureFlags = ['mockFF1', 'mockFF2'];
    expect(hasAnyFeature(['mockFF4', 'mockFF3'], featureFlags)).toBe(false);
  });
});
