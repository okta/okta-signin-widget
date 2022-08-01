import BaseFormObjectV3 from './components/BaseFormObjectV3';
import IdentityPageObject from './IdentityPageObject';

export default class IdentityPageObjectV3 extends IdentityPageObject {
  constructor(t) {
    super(t);
    // override super.form
    this.form = new BaseFormObjectV3(t);
  }
}
