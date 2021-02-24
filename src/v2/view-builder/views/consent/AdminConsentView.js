import BaseView from '../../internals/BaseView';
import AdminConsentViewHeader from './AdminConsentViewHeader';
import ConsentViewForm from './ConsentViewForm';


export default BaseView.extend({
  Header: AdminConsentViewHeader,
  Body: ConsentViewForm,
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
