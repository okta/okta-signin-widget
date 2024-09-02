import { loc } from '@okta/courage';
import { BaseForm, BaseFooter, BaseView } from '../internals';
import Util from 'util/Util';

const Body = BaseForm.extend({

  title() {
    return loc('password.reset.title.generic', 'login');
  },

  save() {
    return loc('oform.next', 'login');
  },

  getUISchema() {
    const schemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    let newSchemas = schemas.map(schema => {
      let newSchema = { ...schema };
      if (schema.name === 'identifier') {
        // We enable the browser's autocomplete for the identifier input
        // because we want to allow the user to choose from previously used identifiers.
        newSchema = {
          ...newSchema,
          autoComplete: Util.getAutocompleteValue(this.options.settings, 'username')
        };
      }
      return newSchema;
    });
    return newSchemas;
  },
});

export default BaseView.extend({
  Body,
  Footer: BaseFooter,
});
