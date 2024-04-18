import { Databag } from '@/types';
import { hasFeature } from '@/utils';

type IdpDiscovery = {
  requestContext?: string;
}

const getStateTokenAllFlows = (databag: Databag) => {
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


const getIdpDiscoveryRequestContext = (databag: Databag) => {
  const { fromUri, stateToken } = databag;
  const stateTokenAllFlows = getStateTokenAllFlows(databag);
  const idpDiscoveryRequestContext = stateTokenAllFlows && stateToken
    ? stateToken : fromUri;
  return idpDiscoveryRequestContext;
};


export const getIdpDiscovery = (databag: Databag) => {
  const { featureFlags, idpDiscovery } = databag;
  const res = {} as IdpDiscovery;

  const requestContext = getIdpDiscoveryRequestContext(databag);

  if (requestContext) {
    res.requestContext = requestContext;
  }

  if (!hasFeature('IDP_DISCOVERY', featureFlags)) {
    return res;
  }

  return { ...res, ...idpDiscovery };
};
