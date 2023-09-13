import { _, createButton, View, loc } from '@okta/courage';
import { BaseForm, BaseView } from '../internals';
import hbs from '@okta/handlebars-inline-precompile';
import CookieUtil from '../../../util/CookieUtil';

//TODO move to utils
/*
function getMinutesString(factorLifetimeInMinutes) {
  if (factorLifetimeInMinutes > 60 && factorLifetimeInMinutes <= 1440) {
    const lifetimeInHours = factorLifetimeInMinutes / 60;

    return loc('hours', 'login', [lifetimeInHours]);
  } else if (factorLifetimeInMinutes > 1440) {
    const lifetimeInDays = factorLifetimeInMinutes / 1440;

    return loc('days', 'login', [lifetimeInDays]);
  }
  //Use minutes as the time unit by default
  if (factorLifetimeInMinutes === 1) {
    return loc('minutes.oneMinute', 'login');
  }
  return loc('minutes', 'login', [factorLifetimeInMinutes]);
}

const getInfo = hbs`
  <div>You won't be asked to authenticate again for next {{sessionlifetime}}</div>`;
*/

//TODO, this is just a POC, should use transformer
const AskMeAgainCheckBox = View.extend({
  className: 'do-not-ask-me-again',
  template: hbs(
    '\
      <p><input class="do-not-ask-me-again-checkbox" type=checkbox />&nbsp;&nbsp;Don\'t ask me again</p>\
    '
  ),
  postRender() {
    this.$el.find('.do-not-ask-me-again-checkbox').on('click', (event) => {
      this.model.attributes = {...this.model.attributes, donotAskAgain: event.target.checked};
    });
  },
});


const Body = BaseForm.extend({
  className: 'kmsi',
  title() {
    return 'Stay signed in';
  },
  render() {
    BaseForm.prototype.render.apply(this, arguments);

    //TODO, this is just a POC, should use transformer
    const buttonYes = createButton({
      className: 'button-primary default-custom-button',
      title: 'Stay signed in',
      click: () => {
        this.model.attributes = {...this.model.attributes, kmsi: true};
        this.submitForm();
      }
    });
    const buttonNo = createButton({
      className: 'button-secondary default-custom-button',
      title: 'Skip',
      click: () => {
        this.model.attributes = {...this.model.attributes, kmsi: false};
        this.submitForm();
      }
    });
    this.add(buttonYes);
    this.add(buttonNo);
    this.add(AskMeAgainCheckBox);
  },
  noButtonBar: true,
  initialize() {
    //BaseForm.prototype.initialize.apply(this, arguments);
    //const factorLifetimeInMinutesStr = this.options.appState.getSchemaByName('kmsi').messages.value[0].message;
    //const factorLifetimeInMinutes = parseInt(factorLifetimeInMinutesStr);
    //const info = getInfo();
    //this.add(info);
  },
  getUISchema() {
    /*
    const schemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    const newSchemas = [];
    //const donotAskAgainSchema = schemas.find(schema => schema.name === 'donotAskAgain');
    //newSchemas.push(donotAskAgainSchema);

    const buttonYes = createButton({
      className: 'button-primary default-custom-button',
      title: 'Stay signed in',
      click: () => {
        this.model.attributes = {...this.model.attributes, kmsi: true};
        //this.model.set('kmsi', true);
        this.saveForm(this.model);
      }
    });
    const buttonNo = createButton({
      className: 'button-secondary default-custom-button',
      title: 'Skip',
      click: () => {
        this.model.attributes = {...this.model.attributes, kmsi: false};
        //this.model.set('kmsi', false);
        this.saveForm(this.model);
      }
    });

    schemas.push({
      View: buttonYes,
    }, {
      View: buttonNo,
    })*/
    return [];
  },
  submitForm() {
    /*
    let kmsiOption = "kmsi";
    if (this.model.attributes.kmsi == false) {
      if (this.model.attributes.donotAskAgain) {
        kmsiOption = "donotAskAgain"
      }
    }

    CookieUtil.setKmsiOptionCookie(kmsiOption);
    */
    this.saveForm(this.model);
  }
});

export default BaseView.extend({
  Body,
});
