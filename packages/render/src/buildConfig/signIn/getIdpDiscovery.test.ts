import { Databag } from '@/types';
import { getIdpDiscovery } from './getIdpDiscovery';

describe('getIdpDiscovery', () => {
  describe('no IDP_DISCOVERY FF', () => {
    const databag = {
      featureFlags: ['random-ff'],
      fromUri: 'fake-fromuri',
      stateToken: 'fake-stateToken'
    } as Databag;

    it('returns fromUri in requestContext when neither STATE_TOKEN_ALL_FLOWS FF nor usingDeviceFlow exists', () => {
      const testData = { ...databag };
      expect(getIdpDiscovery(testData)).toMatchInlineSnapshot(`
        {
          "requestContext": "fake-fromuri",
        }
      `);
    });

    it('returns stateToken in requestContext when has STATE_TOKEN_ALL_FLOWS FF', () => {
      const testData = { ...databag, featureFlags: ['STATE_TOKEN_ALL_FLOWS'] };
      expect(getIdpDiscovery(testData)).toMatchInlineSnapshot(`
        {
          "requestContext": "fake-stateToken",
        }
      `);
    });

    it('returns stateToken in requestContext when has usingDeviceFlow', () => {
      const testData = { ...databag, usingDeviceFlow: true };
      expect(getIdpDiscovery(testData)).toMatchInlineSnapshot(`
        {
          "requestContext": "fake-stateToken",
        }
      `);
    });
  });

  it('use requestContext from idpDiscovery when has IDP_DISCOVERY FF', () => {
    const databag = {
      featureFlags: ['IDP_DISCOVERY'],
      fromUri: 'fake-fromuri',
      stateToken: 'fake-stateToken',
      idpDiscovery: {
        requestContext: 'mock-requestContext'
      }
    } as Databag;
    expect(getIdpDiscovery(databag)).toMatchInlineSnapshot(`
      {
        "requestContext": "mock-requestContext",
      }
    `);
  });
});
