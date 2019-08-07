import { View, _ } from 'okta';
import Link from '../components/Link';

export default View.extend({

  className: 'auth-footer',

  links: [],

  initialize () {
    const links = _.resultCtx(this, 'links', this);

    links.forEach(link => {
      this.add(Link, {
        options: _.pick(link, 'name', 'label', 'href'),
      });
    });
  }
});
