import { BaseView } from '../../internals';
import AdminConsentViewHeader from './AdminConsentViewHeader';
import ConsentViewForm from './ConsentViewForm';

export default BaseView.extend({
  Header: AdminConsentViewHeader,
  Body: ConsentViewForm,
  createModelClass(currentViewState) {
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const {scopes} = currentViewState.uiSchema[0];

    return ModelClass.extend({
      props: {
        scopes: {type: 'array', value: scopes},
      },
      local: {
        consent: {type: 'boolean', value: false},
      },
      toJSON: function() {
        return {consent: this.get('consent')};
      }
    });
  }
});
