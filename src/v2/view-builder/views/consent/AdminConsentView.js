import { BaseView } from '../../internals';
import { loc } from '@okta/courage';
import AdminConsentViewHeader from './AdminConsentViewHeader';
import ConsentViewForm from './ConsentViewForm';
import { doesI18NKeyExist } from '../../../ion/i18nTransformer';

export default BaseView.extend({
  Header: AdminConsentViewHeader,
  Body: ConsentViewForm,
  createModelClass(currentViewState) {
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const { uiSchema } = currentViewState;
    const { scopes } = uiSchema[0];

    const i18nKeyPrefix = 'consent.scopes';

    const localizedScopes = scopes.map(({ name, displayName, description }) => {
      const scopeKey = `${i18nKeyPrefix}.${name}`;
      const labelKey = `${scopeKey}.label`;
      const descKey = `${scopeKey}.desc`;
      const doesLabelExist = doesI18NKeyExist(labelKey);
      const doesDescExist = doesI18NKeyExist(descKey);
      const i18nDisplayName = doesLabelExist ? loc(labelKey, 'login') : displayName;
      const i18nDescription = doesDescExist ? loc(descKey, 'login'): description;

      return {
        name,
        displayName: i18nDisplayName,
        description: i18nDescription,
        isCustomized: !doesLabelExist,
      };
    });

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
