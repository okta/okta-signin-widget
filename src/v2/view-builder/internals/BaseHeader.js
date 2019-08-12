import { View, $ } from 'okta';
import HeaderBeacon from '../components/HeaderBeacon';
import Animations from 'util/Animations';

export default View.extend({
  initialize () {
    // add beacon
    this.add(HeaderBeacon);
  },

  postRender () {
    $('#okta-sign-in').removeClass('no-beacon');

    // animate beacon
    var selector = '[data-type="beacon-container"]', container = this.$el.find(selector);
    Animations.explode(container);
  },
});
