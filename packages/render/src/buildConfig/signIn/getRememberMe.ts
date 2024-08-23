import { Databag } from '@/types';

export const getRememberMe = (databag: Databag) => {
  const { orgctx, isSamlForceAuthnPrompt } = databag;
  return !!orgctx.org?.rememberMeEnabled && !isSamlForceAuthnPrompt;
};
