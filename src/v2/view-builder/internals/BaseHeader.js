import { View, $ } from 'okta';
import Animations from 'util/Animations';
import Enums from 'util/Enums';

export default View.extend({
  HeaderBeacon: null,

  initialize () {
    if (this.HeaderBeacon) {
      this.add(this.HeaderBeacon);
    }
  },

  postRender () {
    if (this.HeaderBeacon) {
      $(`#${Enums.WIDGET_CONTAINER_ID}`).removeClass('no-beacon');

      // animate beacon
      var selector = '[data-type="beacon-container"]', container = this.$el.find(selector);
      Animations.explode(container);
    }
  },
});
