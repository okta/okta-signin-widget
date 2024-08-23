import { Databag } from '@/types';
import { getRememberMe } from './getRememberMe';

describe('getRememberMe', () => {
  it('returns true when org.rememberMeEnabled exists and isSamlForceAuthnPrompt is falsy', () => {
    const databag = {
      orgctx: {
        org: {
          rememberMeEnabled: true
        }
      },
      isSamlForceAuthnPrompt: false
    } as Databag;
    expect(getRememberMe(databag)).toBe(true);
  });

  it('returns false when rememberMeEnabled is falsy', () => {
    expect(getRememberMe({ 
      orgctx: {
        org: {
          rememberMeEnabled: false,
        }
      } 
    } as Databag)).toBe(false);

    expect(getRememberMe({ 
      orgctx: { 
        org: undefined
      } 
    } as Databag)).toBe(false);

    expect(getRememberMe({ 
      orgctx: { 
        org: {
          rememberMeEnabled: false
        }
      } 
    } as Databag)).toBe(false);
  });

  it('returns false when isSamlForceAuthnPrompt is true', () => {
    expect(getRememberMe({ 
      orgctx: { 
        org: {
          rememberMeEnabled: true
        }
      },
      isSamlForceAuthnPrompt: true,
    } as Databag)).toBe(false);
  });
});
