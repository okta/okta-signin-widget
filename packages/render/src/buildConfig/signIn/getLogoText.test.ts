import { Databag } from '@/types';
import { getLogoText } from './getLogoText';

describe('getLogoText', () => {
  it('uses orgName when MULTIBRAND FF not exist', () => {
    const databag = {
      featureFlags: ['fake-ff'],
      orgName: 'fake-orgname'
    } as Databag;
    expect(getLogoText(databag)).toBe('fake-orgname logo');
  });

  it('uses orgName when MULTIBRAND FF and brandName exist', () => {
    const databag = {
      featureFlags: ['MULTIBRAND'],
      orgName: 'fake-orgname',
      brandName: 'fake-brandname'
    } as Databag;
    expect(getLogoText(databag)).toBe('fake-brandname logo');
  });
});
