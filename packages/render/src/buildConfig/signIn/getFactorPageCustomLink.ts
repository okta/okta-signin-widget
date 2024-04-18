import { Databag } from '@/types';

type FactorPageCustomLink = {
  text: string;
  href: string;
}

export const getFactorPageCustomLink = (databag: Databag) => {
  const {
    orgLoginPageSettings: {
      factorPageCustomLinkText,
      factorPageCustomLinkHref,
    }
  } = databag;

  const res = {} as FactorPageCustomLink;
  if (factorPageCustomLinkText) {
    res.text = factorPageCustomLinkText;
    res.href = factorPageCustomLinkHref as string;
  }

  return res;
};
