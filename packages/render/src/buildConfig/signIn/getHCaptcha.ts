import { Databag } from '@/types';

interface HCaptchaOptions {
  scriptSource: string;
  scriptParams?: Record<string, string>;
}

export const getHCaptcha = ({
  countryIso
}: Databag): HCaptchaOptions | undefined => {
  switch (countryIso) {
    case 'CN':
      return {
        scriptSource: 'https://cn1.hcaptcha.com/1/api.js',
        scriptParams: {
          apihost: 'https://cn1.hcaptcha.com',
          endpoint: 'https://cn1.hcaptcha.com',
          assethost: 'https://assets-cn1.hcaptcha.com',
          imghost: 'https://imgs-cn1.hcaptcha.com',
          reportapi: 'https://reportapi-cn1.hcaptcha.com',
        }
      };
  }
  return undefined;
};
