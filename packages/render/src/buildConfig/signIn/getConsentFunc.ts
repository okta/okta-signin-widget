import { Databag } from '@/types';

export const getConsentFunc = ({ consentCancelUrl }: Databag) => {
  if (!consentCancelUrl) {
    return;
  }
  return {
    cancel: function () {
      window.location.href = consentCancelUrl;
    }
  };
};
