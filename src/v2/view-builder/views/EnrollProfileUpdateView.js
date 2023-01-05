import { loc, View } from '@okta/courage';
import { BaseFooter, BaseForm, BaseView } from '../internals';
import hbs from '@okta/handlebars-inline-precompile';
import { getSkipSetupLink } from '../utils/LinksUtil';

const Body = BaseForm.extend({

  className: 'profile-update',

  title() {
    return loc('oie.profile.additional.title', 'login');
  },
  
  save() {
    return loc('enroll.choices.submit.finish', 'login');
  },

  getUISchema() {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    uiSchemas.forEach(input => {
      if (input.name === 'userProfile.secondEmail') {
        input.explain = View.extend({
          template: hbs`{{{i18n
            code="oie.profile.additional.secondemail.subtitle"
            bundle="login" 
            $1="<span class='strong'>$1</span>"}}}`
        });
      }
    });
    
    return uiSchemas;
  },

  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
  },
});

const Footer = BaseFooter.extend({
  className: 'auth-footer side-by-side-links',
  links: function() {
    const { uiSchema } = this.options.currentViewState;
    const optionalParams = uiSchema.filter(item => item.required === false);
    if(uiSchema.length === optionalParams.length) {
      return getSkipSetupLink(this.options.appState, loc('oie.enroll.skip.profile', 'login'));
    } else {
      this.$el.removeClass('.side-by-side-links');
    }
  }
});

export default BaseView.extend({
  Body,
  Footer,

  postRender() {
    BaseView.prototype.postRender.apply(this, arguments);
    /**
     * As per requirement of this flow set secondEmail default to empty string, if exists in remediation
     * ideally server should have passed default string in remediation
     */
    if (this.options.appState.getSchemaByName('userProfile.secondEmail')) {
      this.model.set('userProfile.secondEmail', '');
    }
  }
});