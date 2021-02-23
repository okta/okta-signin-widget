import { loc } from 'okta';

import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';
import AdminConsentViewHeader from './AdminConsentViewHeader';


const Body = BaseForm.extend(
  {
    noButtonBar: false,
    noCancelButton: false,
    save: () => loc('consent.required.consentButton', 'login'),
    cancel: () => loc('consent.required.cancelButton', 'login'),
    title: false,
    events: {
      'click input[data-type="save"]': function () {
        this.setConsent(true);
      },
    },
    setConsent (bool) {
      this.model.set('consent', bool);
    },
    cancelForm () {
      // override BaseForm.prototype.cancelForm which cancels auth flow
      this.setConsent(false);
      this.options.appState.trigger('saveForm', this.model);
    },
  },
);

export default BaseView.extend({
  Header: AdminConsentViewHeader,
  Body,
  postRender () {
    // Move buttons in DOM to match visual hierarchy to fix tab order.
    // TODO https://oktainc.atlassian.net/browse/OKTA-350521
    const buttonContainer = this.$el.find('.o-form-button-bar');
    buttonContainer.find('.button-primary').appendTo(buttonContainer);

  },
  createModelClass (currentViewState) {
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const {scopes} = currentViewState.uiSchema[0];

    return ModelClass.extend({
      props: {
        scopes: {type: 'array', value: scopes},
      },
      local: {
        consent: {type: 'boolean', value: false},
      },
      toJSON: function () {
        return {consent: this.get('consent')};
      }
    });
  }
});
