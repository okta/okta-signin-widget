import { loc, createButton } from '@okta/courage';
import { BaseForm, BaseView } from '../../internals';

const Body = BaseForm.extend({
  noSubmitButton: true,

  title() {
    return loc('oie.kmsi.title', 'login');
  },

  subtitle() {
    return loc('oie.kmsi.subtitle', 'login');
  },

  saveForm(isKeepMeSignedIn) {
    this.model.set('keepMeSignedIn', isKeepMeSignedIn);
    this.options.appState.trigger('saveForm', this.model);
  },

  // Overrides the default getUISchema in order to render 2 buttons instead of a checkbox
  getUISchema() {
    const form = this;
    const acceptButton = createButton({
      className: 'button button-secondary',
      title: loc('oie.kmsi.accept', 'login'),
      attributes: { 'data-se': 'stay-signed-in-btn' },
      click: function() {
        form.saveForm(true);
      },
    });
    const rejectButton = createButton({
      className: 'button button-secondary',
      title: loc('oie.kmsi.reject', 'login'),
      attributes: { 'data-se': 'do-not-stay-signed-in-btn' },
      click: function() {
        form.saveForm(false);
      },
    });
    return [{ View: acceptButton }, { View: rejectButton }];
  }
});

export default BaseView.extend({ Body });
