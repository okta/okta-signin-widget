import { Databag } from '@/types';
import { getLogoText } from './getLogoText';

describe('getLogoText', () => {
  it('uses orgName when MULTIBRAND FF not exist', () => {
    const databag = {
      featureFlags: ['fake-ff'],
      orgctx: {
        org: {
          name: 'fake-orgname', 
        }
      }
    } as Databag;
    expect(getLogoText(databag)).toBe('fake-orgname logo');
  });

  it('uses orgName when MULTIBRAND FF and brandName exist', () => {
    const databag = {
      featureFlags: ['MULTIBRAND'],
      orgctx: {
        org: {
          name: 'fake-orgname', 
        }
      },
      brandName: 'fake-brandname'
    } as Databag;
    expect(getLogoText(databag)).toBe('fake-brandname logo');
  });
});
