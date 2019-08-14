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
    const links = _.resultCtx(this, 'links', this);
    let cancelFn = this.options.appState.get('currentState').cancel;
    let cancelObj = {
      'actionPath': 'cancel',
      'label': 'Sign out',
      'name': 'cancel',
      'type': 'link'
    };
    const isTerminalState = this.options.appState.get('currentState').status === 'TERMINAL';

    if (_.isFunction(cancelFn) && !isTerminalState) {
      //add cancel/signout link
      links.push(cancelObj);
    }

    links.forEach(link => {
      this.add(Link, {
        options: link,
      });
    });
  }
});
