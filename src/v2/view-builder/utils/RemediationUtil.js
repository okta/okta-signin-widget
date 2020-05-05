const getIdpButtons = (idx) => {
  const redirectObjets = idx.neededToProceed.filter( idp => idp.name === 'redirect');
  //const idpButtons = [];
  if (redirectObjets && redirectObjets.length) {
    //add buttons from idp object
    return redirectObjets.map((idpButton) => {
      if (idpButton.relatesTo) {
        let classes = ['social-auth-button'];
        if (idpButton.relatesTo.type) {
          const idpClass = `social-auth-${idpButton.relatesTo.type.toLowerCase()}-button`;
          classes.push(idpClass);
        }
        const button = {
          attributes: {
            'data-se': 'social-auth-button'
          },
          className: classes.join(' '),
          title: function () {
            return `Sign in with ${idpButton.relatesTo.name}`;
          },
          href: idpButton.href,
        };
        return button;
      }
    });
  }
};

export {
  getIdpButtons
};