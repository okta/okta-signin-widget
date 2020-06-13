import { loc } from 'okta';

const getIdpButtons = (idx) => {
  const redirectObjets = idx.neededToProceed.filter(idp => idp.name === 'redirect-idp');

  if (!Array.isArray(redirectObjets)) {
    return [];
  }

  //add buttons from idp object
  return redirectObjets.map((idpButton) => {
    let classes = ['social-auth-button'];
    if (idpButton.type) {
      const idpClass = `social-auth-${idpButton.type.toLowerCase()}-button`;
      classes.push(idpClass);
    }
    const idpName = idpButton.idp.name;
    const button = {
      attributes: {
        'data-se': 'social-auth-button'
      },
      className: classes.join(' '),
      title: function () {
        return loc('oie.sign.in.with.idp', 'login', [idpName]);
      },
      href: idpButton.href,
    };
    return button;
  });
};

export {
  getIdpButtons
};
