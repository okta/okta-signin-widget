import type { Databag } from '@/types';

export const getAccountChooserDiscoveryUrl = (databag: Databag) => {
  const { appProperties } = databag;
  return appProperties.accountChooserDiscoveryUrl;
};
