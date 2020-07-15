import { View, _, $ } from 'okta';
import Link from '../components/Link';
import { getSignOutLink } from '../utils/LinksUtil';

/**
 * When `href` is present, the Link behaviors as normal link (anchor element).
 * When `actionPath` is present, the Link behaviors as link button
 *   on which user clicks, will trigger the action `actionPath`.
 * When `formName` is present, the link behaviors as link button
 *   on which user clicks, will submit a remediation form.
 *
 * @typedef {Object} Link
 * @property {string} label
 * @property {string} name
 * @property {string=} href
 * @property {string=} actionPath
 * @property {string=} formName
 */


export default View.extend({

  className: 'auth-footer',

  /**
   * {Link[]} links
   */
  links: [],

  initialize () {
    let links = _.resultCtx(this, 'links', this);

    // safe check
    // 1. avoid none array from override
    // 2. ignore any none plain object arguments
    if (!Array.isArray(links)) {
      links = [];
    } else {
      links = links.filter(l => $.isPlainObject(l));
    }

    const settings = this.options.settings;

    if (this.options.appState.get('showSignoutLink')) {
      //add cancel/signout link
      links = links.concat(getSignOutLink(settings));
    }

    links.forEach(link => {
      this.add(Link, {
        options: link,
      });
    });
  }
});
