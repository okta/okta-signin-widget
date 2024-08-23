import { Databag } from '@/types';
import { getBrandColors } from './getBrandColors';

describe('getBrandColors', () => {
  it('returns undefined when not use siw gen3', () => {
    const databag = {
      useSiwGen3: false,
    } as Databag;
    expect(getBrandColors(databag)).toBeUndefined();
  });

  it('matches snapshot', () => {
    const databag = {
      useSiwGen3: true,
      brandPrimaryColor: 'mock-brandPrimaryColor',
      brandPrimaryColorContrast: 'mock-brandPrimaryColorContrast',
      brandSecondaryColor: 'mock-brandSecondaryColor',
      brandSecondaryColorContrast: 'mock-brandSecondaryColorContrast'
    } as Databag;
    expect(getBrandColors(databag)).toMatchInlineSnapshot(`
      {
        "primaryColor": "mock-brandPrimaryColor",
        "primaryColorContrast": "mock-brandPrimaryColorContrast",
        "secondaryColor": "mock-brandSecondaryColor",
        "secondaryColorContrast": "mock-brandSecondaryColorContrast",
      }
    `);
  });
});