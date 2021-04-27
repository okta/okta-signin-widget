import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class PlaygroundErrorPageObject extends BasePageObject {

  constructor(t) {
    super(t);
    this.title = new Selector('#error-landing-title');
  }

  hasTitle() {
    return !!this.title;
  }
}
