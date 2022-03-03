import { loc } from 'okta';
import { BaseForm, BaseFooter, BaseView } from '../internals';

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
          autoComplete: 'identifier'
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
