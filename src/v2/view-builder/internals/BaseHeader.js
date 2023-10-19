import { View, $ } from '@okta/courage';
import Animations from 'util/Animations';
import Enums from 'util/Enums';

export default View.extend({
  HeaderBeacon: null,

  initialize() {
    this.add('<img class="pika-img" src="/assets/js/sdk/okta-signin-widget/7.11.1-local/img/pika/pika-stuffed-animal.png"/>');
    if (this.HeaderBeacon) {
      this.add(this.HeaderBeacon);
    }
  },

  postRender() {
    const mainContentContainer = $(`#${Enums.WIDGET_CONTAINER_ID}`);

    if (this.HeaderBeacon) {
      mainContentContainer.removeClass('no-beacon');

      // animate beacon
      const beaconContainer = this.$el.find('[data-type="beacon-container"]');
      Animations.explode(beaconContainer);
    } else {
      mainContentContainer.addClass('no-beacon');
    }
  },
});
