import { BaseForm } from '../../internals';

export default BaseForm.extend({

  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.model.set('useRedirect', true);
  }

});
