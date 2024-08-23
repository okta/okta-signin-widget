import { Databag } from '@/types';
import { getFactorPageCustomLink } from './getFactorPageCustomLink';

describe('getFactorPageCustomLink', () => {
  it('returns empty object when no factorPageCustomLinkText exist', () => {
    const databag = { orgLoginPageSettings: {} } as Databag;
    expect(getFactorPageCustomLink(databag)).toEqual(undefined);
  });

  it('matches snapshot when factorPageCustomLinkText exist', () => {
    const databag = {
      orgLoginPageSettings: {
        factorPageCustomLinkText: 'mock-factorPageCustomLinkText',
        factorPageCustomLinkHref: 'https://mock.href',
      }
    } as Databag;
    expect(getFactorPageCustomLink(databag)).toMatchInlineSnapshot(`
      {
        "href": "https://mock.href",
        "text": "mock-factorPageCustomLinkText",
      }
    `);
  });
});
