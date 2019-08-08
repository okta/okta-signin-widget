import { View, _ } from 'okta';
import Link from '../components/Link';

/**
 * When `href` is present, the Link behaviors as normal web link.
 * When `actionName` is present, the Link behaviors as link button
 *    upon click, will trigger the action `actionName`.
 * @typedef {Object} Link
 * @property {string} label
 * @property {string} name
 * @property {string=} href
 * @property {string=} actionName
 */


export default View.extend({

  className: 'auth-footer',

  /**
   * {Link[]} links
   */
  links: [],

  initialize () {
    const links = _.resultCtx(this, 'links', this);

    links.forEach(link => {
      this.add(Link, {
        options: link,
      });
    });
  }
});
