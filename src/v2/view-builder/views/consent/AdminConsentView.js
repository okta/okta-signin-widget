import { BaseView } from '../../internals';
import { loc } from 'okta';
import AdminConsentViewHeader from './AdminConsentViewHeader';
import ConsentViewForm from './ConsentViewForm';

export default BaseView.extend({
  Header: AdminConsentViewHeader,
  Body: ConsentViewForm,
  createModelClass(currentViewState) {
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const {scopes} = currentViewState.uiSchema[0];
    const i18nKeyPrefix = 'consent.scopes';
    const localizedScopes = scopes.map(({name}) => ({
      name,
      displayName: loc(`${i18nKeyPrefix}.${name}.label`, 'login'),
      description: loc(`${i18nKeyPrefix}.${name}.desc`, 'login'),
    }));

    return ModelClass.extend({
      props: {
        scopes: {type: 'array', value: localizedScopes},
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
