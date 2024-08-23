import type { Databag } from '@/types';
import { getAccountChooserDiscoveryUrl } from './getAccountChooserDiscoveryUrl';

describe('getAccountChooserDiscoveryUrl', () => {
  it('returns accountChooserDiscoveryUrl from appProperties', () => {
    const databag = {
      appProperties: {
        accountChooserDiscoveryUrl: 'fake-url'
      }
    } as Databag;
    expect(getAccountChooserDiscoveryUrl(databag)).toBe('fake-url');
  });
});
