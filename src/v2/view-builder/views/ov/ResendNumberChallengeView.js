import { _, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { WARNING_TIMEOUT } from '../../utils/Constants';

const ResendNumberChallengeView = View.extend({
  initialize() {
    this.listenTo(this.options.appState, 'showNumberChallengeWarning',  () => {
      this.startWarningTimeout();
    });

    this.listenTo(this.options.appState, 'hideNumberChallengeWarning', () => {
      this.clearWarning();
    });
  },
  className: 'resend-number-challenge-warning hide',
  template: hbs`
      <div class="okta-form-infobox-warning infobox infobox-warning">
        <span class="icon warning-16"></span>
        <p>{{i18n
          code="oie.numberchallenge.warning"
          bundle="login"
          $1="<a href='#' class='resend-number-challenge'>$1</a>"}}
        </p>
      </div>
  `,
  showWarning() {
    this.$el.removeClass('hide');
  },
  clearWarning() {
    this.$el.addClass('hide');
    clearTimeout(this.warningTimeout);
    this.startWarningTimeout();
  },
  startWarningTimeout() {
    this.warningTimeout = setTimeout(_.bind(function() {
      this.showWarning();
    }, this), WARNING_TIMEOUT);
  }
});

export default ResendNumberChallengeView;
