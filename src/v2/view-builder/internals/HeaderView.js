import { View } from 'okta';
import FactorBeacon from '../components/FactorBeacon';
import Animations from 'util/Animations';

export default View.extend({
  initialize () {
    // add beacon
    this.add(FactorBeacon);
  },

  postRender () {
    // animate beacon
    var selector = '[data-type="beacon-container"]', container = this.$el.find(selector);
    Animations.explode(container);
  },
});
