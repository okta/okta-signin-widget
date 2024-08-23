import { Databag } from '@/types';
import { hasFeature } from '@/utils';

export const getCustomButtons = (databag: Databag) => {
  const { fromURI = '', showX509button, featureFlags, i18n, repost } = databag;
  const { idpBasedPivCardButton, pivCardButton } = i18n;
  
  if (!showX509button || hasFeature('X509_LOGIN_BUTTON_IN_SIGN_IN_WIDGET', featureFlags)) {
    return [];
  }

  let pivTitle = pivCardButton;
  let pivClassName = '';

  // Use different title and color when IDP_BASED_SIGN_ON_POLICY is enabled
  if (hasFeature('IDP_BASED_SIGN_ON_POLICY', featureFlags) && !hasFeature('IDENTITY_ENGINE', featureFlags)) {
    pivTitle = idpBasedPivCardButton;
    pivClassName = 'idp-piv-button';
  }

  const customButtons = [{
    title: pivTitle,
    className: pivClassName,
    click: function () {
      if (repost) {
        (document.getElementById('x509_login') as HTMLFormElement).submit();
      } else {
        window.location.href = '/login/cert?fromURI=' + encodeURIComponent(fromURI);
      }
    }
  }];

  return customButtons;
};
