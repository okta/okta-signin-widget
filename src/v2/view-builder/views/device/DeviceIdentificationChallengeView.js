import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { BaseForm, BaseView } from '../../internals';

const DeviceIdentificationChallengeView = View.extend({
  // eslint-disable-next-line @okta/okta/no-unlocalized-text-in-templates
  template: hbs`
    <div class="ion-messages-container">
      <p>Collecting device signals... </p>
    </div>
    `
});

const Body = BaseForm.extend(Object.assign(
  {
    title() {
      return  'DeviceChallengeHandshake';
    },

    noButtonBar: true,

    initialize() {
      BaseForm.prototype.initialize.apply(this, arguments);
    },

    render() {
      BaseForm.prototype.render.apply(this, arguments);
      this.add(new DeviceIdentificationChallengeView());
    },
  },
));

export default BaseView.extend({
  Body
});
