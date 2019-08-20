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
    const cancelFn = this.options.appState.get('currentState').cancel;
    // hide signout for IDENTIFY step
    const isIdentifyStep = this.options.appState.get('isIdentifyStep');
    if (_.isFunction(cancelFn) && !isIdentifyStep) {
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
