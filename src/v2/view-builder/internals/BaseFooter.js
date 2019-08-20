import { View, _ } from 'okta';
import Link from '../components/Link';

/**
 * When `href` is present, the Link behaviors as normal web link.
 * When `actionPath` is present, the Link behaviors as link button
 *    upon click, will trigger the action `actionPath`.
 * @typedef {Object} Link
 * @property {string} label
 * @property {string} name
 * @property {string=} href
 * @property {string=} actionPath
 */


export default View.extend({

  className: 'auth-footer',

  /**
   * {Link[]} links
   */
  links: [],

  initialize () {
    let links = _.resultCtx(this, 'links', this);
    if (this.options.appState.get('showSignoutLink')) {
      //add cancel/signout link
      links = links.concat([
        {
          'actionPath': 'cancel',
          'label': 'Sign out',
          'name': 'cancel',
          'type': 'link'
        },
      ]);
    }

    links.forEach(link => {
      this.add(Link, {
        options: link,
      });
    });
  }
});
