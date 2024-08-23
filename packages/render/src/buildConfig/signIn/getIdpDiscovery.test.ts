import { Databag } from '@/types';
import { getIdpDiscovery, getIdpDiscoveryRequestContext, getStateTokenAllFlows } from './getIdpDiscovery';

describe('getStateTokenAllFlows', () => {
  it('returns true when has FF STATE_TOKEN_ALL_FLOWS', () => {
    const databag = {
      featureFlags: ['STATE_TOKEN_ALL_FLOWS'],
    } as Databag;
    expect(getStateTokenAllFlows(databag)).toBe(true);
  });

  it('returns true when usingDeviceFlow is truthy', () => {
    const databag = {
      featureFlags: ['random-ff'],
      usingDeviceFlow: true,
    } as Databag;
    expect(getStateTokenAllFlows(databag)).toBe(true);
  });

  it('returns false when no STATE_TOKEN_ALL_FLOWS FF and usingDeviceFlow is falsy', () => {
    const databag = {
      featureFlags: ['random-ff'],
    } as Databag;
    expect(getStateTokenAllFlows(databag)).toBe(false);
  });
});

describe('getIdpDiscoveryRequestContext', () => {
  it('returns correct values based on conditions', () => {
    const databag1 = {
      featureFlags: ['STATE_TOKEN_ALL_FLOWS', 'IDP_DISCOVERY'],
      idpDiscovery: true,
      stateToken: 'mock-stateToken',
    } as Databag;
    expect(getIdpDiscoveryRequestContext(databag1)).toBe('mock-stateToken');

    const databag2 = {
      featureFlags: ['STATE_TOKEN_ALL_FLOWS', 'IDP_DISCOVERY'],
      idpDiscovery: true,
      fromURI: 'mock-fromURI'
    } as Databag;
    expect(getIdpDiscoveryRequestContext(databag2)).toBe('mock-fromURI');

    const databag3 = {
      featureFlags: ['IDP_DISCOVERY'],
      idpDiscovery: true,
      fromURI: 'mock-fromURI'
    } as Databag;
    expect(getIdpDiscoveryRequestContext(databag3)).toBe('mock-fromURI');

    const databag4 = {
      featureFlags: ['random-ff'],
    } as Databag;
    expect(getIdpDiscoveryRequestContext(databag4)).toBe(undefined);
  });
});

describe('getIdpDiscovery', () => {
  it('returns correct value', () => {
    const databag1 = {
      featureFlags: ['IDP_DISCOVERY'],
      idpDiscovery: false
    } as Databag;

    expect(getIdpDiscovery(databag1)).toBe(false);

    const databag2 = {
      featureFlags: ['random-ff'],
      idpDiscovery: false
    } as Databag;

    expect(getIdpDiscovery(databag2)).toBe(false);

    const databag3 = {
      featureFlags: ['IDP_DISCOVERY'],
      idpDiscovery: true
    } as Databag;

    expect(getIdpDiscovery(databag3)).toBe(true);

    const databag4 = {
      featureFlags: ['IDP_DISCOVERY'],
    } as Databag;

    expect(getIdpDiscovery(databag4)).toBe(false);

    const databag5 = {
      featureFlags: ['random-ff'],
    } as Databag;

    expect(getIdpDiscovery(databag5)).toBe(false);
  });
});
