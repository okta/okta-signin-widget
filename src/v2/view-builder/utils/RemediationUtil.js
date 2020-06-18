import { loc, _ } from 'okta';
import IDP from '../../../util/IDP';

const getIdpButtons = (remediations) => {
  const redirectObjets = remediations.filter(idp => idp.name === 'redirect-idp');

  if (!Array.isArray(redirectObjets)) {
    return [];
  }

  //add buttons from idp object
  return redirectObjets.map(idpObject => {
    let type = idpObject.type && idpObject.type.toLowerCase();
    let displayName;

    if (!_.contains(IDP.SUPPORTED_SOCIAL_IDPS, type)) {
      type = 'general-idp';
      displayName = idpObject.idp && idpObject.idp.name || '{ Please provide a text value }';
    } else {
      displayName = loc(`socialauth.${type}.label`, 'login');
    }

    let classNames = [
      'social-auth-button',
      `social-auth-${type}-button`,
    ];

    if (idpObject.idp.className) {
      classNames.push(idpObject.idp.className);
    }

    const button = {
      attributes: {
        'data-se': `social-auth-${type}-button`,
      },
      className: classNames.join(' '),
      title: displayName,
      href: idpObject.href,
    };
    return button;
  });
};

export {
  getIdpButtons
};
