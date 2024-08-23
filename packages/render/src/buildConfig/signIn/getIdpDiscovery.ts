import { Databag } from '@/types';
import { hasFeature } from '@/utils';

export const getStateTokenAllFlows = (databag: Databag) => {
  const { featureFlags, usingDeviceFlow } = databag;

  if (hasFeature('STATE_TOKEN_ALL_FLOWS', featureFlags)) {
    return true;
  }

  // Device flow works like STAF even if you don't have the FF
  if (usingDeviceFlow) {
    return true;
  }

  return false;
};


export const getIdpDiscoveryRequestContext = (databag: Databag) => {
  const { featureFlags, idpDiscovery, fromURI, stateToken } = databag;

  if (!hasFeature('IDP_DISCOVERY', featureFlags) || !idpDiscovery) {
    return undefined;
  }

  const stateTokenAllFlows = getStateTokenAllFlows(databag);
  const idpDiscoveryRequestContext = (stateTokenAllFlows && stateToken)
    ? stateToken : fromURI;
  return idpDiscoveryRequestContext;
};


export const getIdpDiscovery = (databag: Databag) => {
  const { featureFlags, idpDiscovery } = databag;

  return !!(hasFeature('IDP_DISCOVERY', featureFlags) && idpDiscovery);
};
