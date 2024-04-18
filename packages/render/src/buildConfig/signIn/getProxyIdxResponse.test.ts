import { Databag } from '@/types';

import { getProxyIdxResponse } from './getProxyIdxResponse';

describe('getProxyIdxResponse', () => {
  it('returns undefined when deviceEnrollment is not available', () => {
    const databag = {
      deviceEnrollment: undefined
    } as Databag;
    expect(getProxyIdxResponse(databag)).toBeUndefined();
  });

  it('returns deviceEnrollment data object', () => {
    const databag = {
      deviceEnrollment: {
        name: 'mock-name',
        platform: 'mock-platform',
        enrollmentLink: 'mock-enrollmentLink',
        vendor: 'mock-vendor',
        signInUrl: 'mock-signInUrl',
        orgName: 'mock-orgName',
        challengeMethod: 'mock-challengeMethod'
      }
    } as Databag;
    expect(getProxyIdxResponse(databag)).toMatchInlineSnapshot(`
      {
        "deviceEnrollment": {
          "type": "object",
          "value": {
            "challengeMethod": "mock-challengeMethod",
            "enrollmentLink": "mock-enrollmentLink",
            "name": "mock-name",
            "orgName": "mock-orgName",
            "platform": "mock-platform",
            "signInUrl": "mock-signInUrl",
            "vendor": "mock-vendor",
          },
        },
      }
    `);
  });
});
