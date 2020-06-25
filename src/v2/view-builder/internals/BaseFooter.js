import { View, _, loc } from 'okta';
import Link from '../components/Link';

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
    if (this.options.appState.get('showSignoutLink')) {
      //add cancel/signout link
      links = links.concat([
        {
          'actionPath': 'cancel',
          'label': loc('signout', 'login'),
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
