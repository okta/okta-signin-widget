import { Databag } from '@/types';
import { getShowPasswordToggleOnSignInPage } from './getShowPasswordToggleOnSignInPage';

describe('getShowPasswordToggleOnSignInPage', () => {
  it('returns true when has SHOW_PASSWORD_TOGGLE_ON_SIGN_IN_PAGE FF', () => {
    const databag = {
      featureFlags: ['SHOW_PASSWORD_TOGGLE_ON_SIGN_IN_PAGE']
    } as Databag;
    expect(getShowPasswordToggleOnSignInPage(databag)).toBe(true);
  });

  it('follows showPasswordVisibilityToggle value when has IDENTITY_ENGINE FF', () => {
    const databag = {
      featureFlags: ['IDENTITY_ENGINE'],
      orgLoginPageSettings: {}
    } as Databag;

    databag.orgLoginPageSettings.showPasswordVisibilityToggle = true;
    expect(getShowPasswordToggleOnSignInPage(databag)).toBe(true);

    databag.orgLoginPageSettings.showPasswordVisibilityToggle = false;
    expect(getShowPasswordToggleOnSignInPage(databag)).toBe(false);
  });

  it('returns false when neither SHOW_PASSWORD_TOGGLE_ON_SIGN_IN_PAGE nor IDENTITY_ENGINE FF exists', () => {
    const databag = {
      featureFlags: ['fake-ff']
    } as Databag;
    expect(getShowPasswordToggleOnSignInPage(databag)).toBe(false);
  });
});