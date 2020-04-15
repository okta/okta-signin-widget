import { createButton } from 'okta';

const getIdpButtons = (idps) => {
  const idpButtons = [];
  if (idps && idps.length) {
    //add buttons from idp object
    idps.forEach((idpButton) => {
      if (idpButton.relatesTo) {
        let classes = ['social-auth-button'];
        const idpClass = `social-auth-${idpButton.relatesTo.type.toLowerCase()}-button`;
        classes.push(idpClass);
        const button = createButton({
          attributes: {
            'data-se': 'social-auth-button'
          },
          className: classes.join(' '),
          title: function () {
            return `Sign in with ${idpButton.relatesTo.name}`;
          },
          click: function (e) {
            e.preventDefault();
            window.location.href = idpButton.href;
          }
        });
        idpButtons.push(button);
      }
    });
  }
  return idpButtons;
};

export {
  getIdpButtons
};