import { View, $ } from 'okta';
import HeaderBeacon from '../components/HeaderBeacon';
import Animations from 'util/Animations';

export default View.extend({
  HeaderBeacon: HeaderBeacon,

  initialize () {
    // add beacon
    this.add(this.HeaderBeacon);
  },

  postRender () {
    $('#okta-sign-in').removeClass('no-beacon');

    // animate beacon
    var selector = '[data-type="beacon-container"]', container = this.$el.find(selector);
    Animations.explode(container);
  },
});
