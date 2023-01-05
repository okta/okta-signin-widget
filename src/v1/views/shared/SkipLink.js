import { loc, View } from '@okta/courage';
import Enums from 'util/Enums';

export default View.extend({
  tagName: 'a',
  className: 'skip-to-content-link',
  attributes: { href: `#${Enums.WIDGET_CONTAINER_ID}` },
  initialize: function initialize() {
    this.$el.append(loc('skip.to.main.content', 'login'));
  }
});
