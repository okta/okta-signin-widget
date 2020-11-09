import { Controller } from 'okta';
import ViewFactory from '../view-builder/ViewFactory';
import {FORMS as RemediationForms} from '../ion/RemediationConstants';

export default Controller.extend({
  className: 'device-enrollment-terminal',

  preRender () {
    this.removeChildren();
  },

  postRender () {
    const currentViewState = this.options.appState.getCurrentViewState();
    if (!currentViewState) {
      return;
    }

    const TheView = ViewFactory.create(
      RemediationForms.DEVICE_ENROLLMENT_TERMINAL
    );
    try {
      this.formView = this.add(TheView, {
        options: {
          currentViewState,
        }
      }).last();
    } catch (error) {
      // This is the place where runtime error (NPE) happens at most of time.
      // It has been swallowed by Q.js hence add try/catch to surface up errors.
      this.options.settings.callGlobalError(error);
      return;
    }

    this.triggerAfterRenderEvent();
  },

  triggerAfterRenderEvent () {
    const contextData = this.createAfterEventContext();
    this.trigger('afterRender', contextData);
  },

});