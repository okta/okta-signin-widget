import { View, $ } from 'okta';
import Animations from 'util/Animations';
import Enums from 'util/Enums';

export default View.extend({
  HeaderBeacon: null,

  initialize() {
    if (this.HeaderBeacon) {
      this.add(this.HeaderBeacon);
    }
  },

  postRender() {
    const mainContentContainer = $(`#${Enums.WIDGET_CONTAINER_ID}`);

    if (this.HeaderBeacon) {
      mainContentContainer.removeClass('no-beacon');

      // animate beacon
      const selector = '[data-type="beacon-container"]';
      const beaconContainer = this.$el.find(selector);
      Animations.explode(beaconContainer);
    } else {
      mainContentContainer.addClass('no-beacon');
    }
  },
});
