import { Databag } from '@/types';
import { getRegistration } from './getRegistration';

describe('getRegistration', () => {
  it('returns true when has SELF_SERVICE_REGISTRATION FF and registrationEnabledForSignInWidget', () => {
    const databag = {
      featureFlags: ['SELF_SERVICE_REGISTRATION'],
      registrationEnabledForSignInWidget: true,
    } as Databag;
    expect(getRegistration(databag)).toBe(true);
  });

  it('returns false when not has SELF_SERVICE_REGISTRATION FF', () => {
    const databag = {
      featureFlags: ['fake-ff'],
      registrationEnabledForSignInWidget: true,
    } as Databag;
    expect(getRegistration(databag)).toBe(false);
  });

  it('returns false when not has SELF_SERVICE_REGISTRATION FF', () => {
    const databag = {
      featureFlags: ['fake-ff'],
      registrationEnabledForSignInWidget: false,
    } as Databag;
    expect(getRegistration(databag)).toBe(false);
  });
});