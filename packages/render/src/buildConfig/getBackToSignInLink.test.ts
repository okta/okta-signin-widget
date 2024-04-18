import type { Databag } from '@/types';

import { getBackToSignInLink } from './getBackToSignInLink';

describe('getBackToSignInLink', () => {
  it('returns empty string when no ENG_EML_FOR_SSR FF', () => {
    const databag = {
      featureFlags: ['fake-ff']
    } as Databag;
    expect(getBackToSignInLink(databag)).toBe('');
  });

  it('returs empty string when no backToSignInLink', () => {
    const databag = {
      featureFlags: ['ENG_EML_FOR_SSR']
    } as Databag;
    expect(getBackToSignInLink(databag)).toBe('');
  });

  it('returs backToSignInLink when ENG_EML_FOR_SSR FF and backToSignInLink value are both available', () => {
    const databag = {
      featureFlags: ['ENG_EML_FOR_SSR'],
      backToSignInLink: 'https://fake-link'
    } as Databag;
    expect(getBackToSignInLink(databag)).toBe('https://fake-link');
  });
});
