import Enums from 'util/Enums';

/**
 * @param iconClass icon class to override
 * @param logoUrl URL where the logo can be retrieved
 */
export function overrideIconForClass(iconClass, logoUrl) {
  const template = `
    #okta-sign-in.auth-container .${iconClass} {
      background-image: url('${logoUrl}')
    }
  `;
  const main = document.getElementById(Enums.WIDGET_CONTAINER_ID);
  const style = document.createElement('style');
  style.id = 'okta-sign-in-config-logos'; // TODO: make a const
  style.type = 'text/css';
  style.appendChild(document.createTextNode(template));
  main.appendChild(style);
}