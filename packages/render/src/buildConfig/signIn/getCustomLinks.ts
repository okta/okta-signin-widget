import type { Databag } from '@/types';
import type { Link } from '@okta/okta-signin-widget';

export const getCustomLinks = (databag: Databag): Link[] => {
  const {
    orgLoginPageSettings: {
      customLinkOneText,
      customLinkOneHref,
      customLinkTwoText,
      customLinkTwoHref,
    }
  } = databag;
  const res: Link[] = [];

  if (customLinkOneText) {
    res.push({
      text: customLinkOneText,
      href: customLinkOneHref as string,
    });
  }
  if (customLinkTwoText) {
    res.push({
      text: customLinkTwoText,
      href: customLinkTwoHref as string,
    });
  }

  return res;
};
