import { Databag } from '@/types';

export const getCustomLinks = (databag: Databag) => {
  const {
    orgLoginPageSettings: {
      customLinkOneText,
      customLinkOneHref,
      customLinkTwoText,
      customLinkTwoHref,
    }
  } = databag;
  const res = [];

  if (customLinkOneText) {
    res.push({
      text: customLinkOneText,
      href: customLinkOneHref,
    });
  }
  if (customLinkTwoText) {
    res.push({
      text: customLinkTwoText,
      href: customLinkTwoHref,
    });
  }

  return res;
};
