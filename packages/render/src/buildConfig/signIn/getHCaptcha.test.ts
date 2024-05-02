import type { Databag } from '@/types';

import { getHCaptcha } from './getHCaptcha';

describe('getHCaptcha', () => {
  it('returns undefined when no countryIso', () => {
    const databag = {} as Databag;
    expect(getHCaptcha(databag)).toBeUndefined();
  });

  it('returns undefined when countryIso != "CN"', () => {
    const databag = {
      countryIso: 'US'
    } as Databag;
    expect(getHCaptcha(databag)).toBeUndefined();
  });

  it('matches snapshot when countryIso == "CN"', () => {
    const databag = {
      countryIso: 'CN'
    } as Databag;
    expect(getHCaptcha(databag)).toMatchInlineSnapshot(`
      {
        "scriptParams": {
          "apihost": "https://cn1.hcaptcha.com",
          "assethost": "https://assets-cn1.hcaptcha.com",
          "endpoint": "https://cn1.hcaptcha.com",
          "imghost": "https://imgs-cn1.hcaptcha.com",
          "reportapi": "https://reportapi-cn1.hcaptcha.com",
        },
        "scriptSource": "https://cn1.hcaptcha.com/1/api.js",
      }
`);
  });
});
