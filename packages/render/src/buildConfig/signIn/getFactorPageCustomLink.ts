import { Databag } from '@/types';

export const getFactorPageCustomLink = (databag: Databag) => {
  const {
    orgLoginPageSettings: {
      factorPageCustomLinkText,
      factorPageCustomLinkHref,
    }
  } = databag;

  let res;
  if (factorPageCustomLinkText) {
    res = {
      text: factorPageCustomLinkText,
      href: factorPageCustomLinkHref as string,
    };
  }

  return res;
};
