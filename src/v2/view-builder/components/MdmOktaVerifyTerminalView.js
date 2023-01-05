import { View, loc, internal } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

const { Notification } = internal.views.components;
const { Clipboard } = internal.util;

export default View.extend({
  template: hbs`
    <div>{{i18n code="enroll.explanation.mdm" bundle="login"}}</div>
    <ol>
      <li>
        {{i18n code="enroll.mdm.step.copyLink" bundle="login"}}
        <a data-clipboard-text="{{enrollmentLink}}" class="button link-button copy-clipboard-button">
          {{i18n code="enroll.mdm.copyLink" bundle="login"}}
        </a>
      </li>
      <li>{{i18n code="enroll.mdm.step.pasteLink" bundle="login"}}</li>
      <li>{{i18n code="enroll.mdm.step.followInstructions" bundle="login" 
      arguments="vendor" $1="<span class='semi-strong'>$1</span>"}}</li>
      <li>{{i18n code="enroll.mdm.step.relogin" bundle="login"}}</li>
    </ol>
  `,

  getTemplateData() {
    return this.options.appState.get('deviceEnrollment');
  },

  postRender: function() {
    // Attach each button to the respective 'data-clipboard-text'
    Clipboard.attach('.copy-clipboard-button').done(() => {
      let notification = new Notification({
        message: loc('enroll.mdm.copyLink.success', 'login'),
        level: 'success',
      });
      this.el.prepend(notification.render().el);
      return false;
    });
  },
});
