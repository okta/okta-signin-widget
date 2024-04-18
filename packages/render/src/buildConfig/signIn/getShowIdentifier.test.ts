import type { Databag } from '@/types';

import { getShowIdentifier } from './getShowIdentifier';

describe('getShowIdentifier', () => {
  it('returns false when no IDENTITY_ENGINE FF', () => {
    const databag = {
      featureFlags: ['random-ff']
    } as Databag;
    expect(getShowIdentifier(databag)).toBe(false);
  });

  it('returns orgLoginPageSettings.showIdentifier boolean value when has IDENTITY_ENGINE FF', () => {
    const databag = {
      featureFlags: ['IDENTITY_ENGINE'],
      orgLoginPageSettings: {
        showIdentifier: true,
      }
    } as Databag;
    expect(getShowIdentifier(databag)).toBe(true);

    databag.orgLoginPageSettings.showIdentifier = false;
    expect(getShowIdentifier(databag)).toBe(false);
  });
});
