
import { View, createButton, loc } from 'okta';

const FactorRow = View.extend({
  className: 'enroll-factor-row clearfix',
  template: '\
        <div class="enroll-factor-icon-container">\
          <div class="factor-icon enroll-factor-icon {{iconClassName}}">\
          </div>\
        </div>\
        <div class="enroll-factor-description">\
          <h3 class="enroll-factor-label">{{label}}</h3>\
          {{#if factorDescription}}\
            <p>{{factorDescription}} </p>\
          {{/if}}\
          <div class="enroll-factor-button"></div>\
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
        this.model.trigger('selectFactor', this.model.get('value'));
      }
    }), '.enroll-factor-button']];
  },
  minimize: function () {
    this.$el.addClass('enroll-factor-row-min');
  }
});

export default FactorRow;