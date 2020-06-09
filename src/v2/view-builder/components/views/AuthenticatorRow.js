
import { View, createButton, loc } from 'okta';

const AuthenticatorRow = View.extend({
  className: 'enroll-factor-row clearfix',
  template: '\
        <div class="enroll-factor-icon-container">\
          <div class="factor-icon enroll-factor-icon {{iconClassName}}">\
          </div>\
        </div>\
        <div class="factor-description">\
          <h3 class="authenticator-label">{{label}}</h3>\
          {{#if factorDescription}}\
            <p>{{factorDescription}} </p>\
          {{/if}}\
          <div class="authenticator-button"></div>\
        </div>\
      ',
  children: function (){
    return [[createButton({
      className: 'button select-factor',
      title: function () {
        if(this.options.appState.get('currentFormName') === 'select-authenticator-enroll') {
          return loc('oie.enroll.authenticator.button.text', 'login');
        } else {
          return loc('oie.verify.authenticator.button.text', 'login');
        }
        
      },
      click: function () {
        this.model.trigger('selectAutheticator', this.model.get('value'));
      }
    }), '.authenticator-button']];
  },
  minimize: function () {
    this.$el.addClass('authenticator-row-min');
  }
});

export default AuthenticatorRow;