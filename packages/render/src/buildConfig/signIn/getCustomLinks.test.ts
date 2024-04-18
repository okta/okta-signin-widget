import type { Databag } from '@/types';

import { getCustomLinks } from './getCustomLinks';

describe('getCustomLinks', () => {
  it('returns empty array when neither customLinkOneText nor customLinkTwoText exists', () => {
    const databag = {
      orgLoginPageSettings: {}
    } as Databag;
    expect(getCustomLinks(databag)).toEqual([]);
  });

  it('adds one link when customLinkOneText exists', () => {
    const databag = {
      orgLoginPageSettings: {
        customLinkOneText: 'mock-customLinkOneText',
        customLinkOneHref: 'https://mock.href',
      }
    } as Databag;
    const res = getCustomLinks(databag);
    expect(res.length).toBe(1);
    expect(res).toMatchInlineSnapshot(`
      [
        {
          "href": "https://mock.href",
          "text": "mock-customLinkOneText",
        },
      ]
    `);
  });

  it('adds two links when customLinkOneText and customLinkTwoText exist', () => {
    const databag = {
      orgLoginPageSettings: {
        customLinkOneText: 'mock-customLinkOneText',
        customLinkOneHref: 'https://mock.1.href',
        customLinkTwoText: 'mock-customLinkTwoText',
        customLinkTwoHref: 'https://mock.2.href',
      }
    } as Databag;
    const res = getCustomLinks(databag);
    expect(res.length).toBe(2);
    expect(res).toMatchInlineSnapshot(`
      [
        {
          "href": "https://mock.1.href",
          "text": "mock-customLinkOneText",
        },
        {
          "href": "https://mock.2.href",
          "text": "mock-customLinkTwoText",
        },
      ]
    `);
  });

});
