import { Databag } from '@/types';
import { hasFeature } from '@/utils';

export const getRegistration = ({ featureFlags, registrationEnabledForSignInWidget }: Databag) => {
  return hasFeature('SELF_SERVICE_REGISTRATION', featureFlags) && registrationEnabledForSignInWidget;
};
