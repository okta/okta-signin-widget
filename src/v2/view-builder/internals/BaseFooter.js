import { View, _, $} from '@okta/courage';
import Link from '../components/Link';
import ToggleTextLink from '../components/ToggleTextLink';
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

  /**
   * View
   * adds any view to the footer in footer info section
   */ 
  footerInfo: null,

  /**
   * Boolean
   * If false then 'Back to sign in' does not get added to the view
   */
  hasBackToSignInLink: true,

  initialize() {
    let links = _.resultCtx(this, 'links', this);
    const footerInfo = _.resultCtx(this, 'footerInfo', this);
    const hasBackToSignInLink = _.resultCtx(this, 'hasBackToSignInLink', this);

    // safe check
    // 1. avoid none array from override
    // 2. ignore any none plain object arguments
    if (!Array.isArray(links)) {
      links = [];
    } else {
      links = links.filter(l => $.isPlainObject(l));
    }

    // add 'back to sign in' link if the form qualifies for it by default.
    // Previously called cancel/Sign Out links
    if (this.options.appState.shouldShowSignOutLinkInCurrentForm(
      this.options.settings.get('features.hideSignOutLinkInMFA') ||
      this.settings.get('features.mfaOnlyFlow')) && hasBackToSignInLink) {
      links = links.concat(getSignOutLink(this.options.settings));
    }

    links.forEach(link => {
      let LinkView = Link;
      if (link.type === 'toggle-text-link') {
        LinkView = ToggleTextLink;
      }
      this.add(LinkView, { options: link });
    });

    if (footerInfo) {
      this.add(View.extend({
        className: 'footer-info',
      }));

      this.add(footerInfo, '.footer-info');
    }
  }
});
