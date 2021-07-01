import { Form, Model } from 'okta';
import Settings from 'models/Settings';

describe('courage for signin widget', () => {
  let testContext;
  beforeEach(() => {
    testContext = {};
  });
  describe('Form', () => {
    beforeEach(() => {
      testContext.model = new Model();
      testContext.settings = new Settings({ baseUrl: 'http://localhost:3000' });
    });
    describe('scrollOnError', () => {
      it('is true by default', () => {
        const { model, settings } = testContext;
        const form = new Form({ model, settings });
        expect(form.getAttribute('scrollOnError')).toBe(true);
      });
      it('can be overriden by child definition', () => {
        const { model, settings } = testContext;
        const MyForm = Form.extend({
          scrollOnError: false
        });
        const form = new MyForm({ model, settings });
        expect(form.getAttribute('scrollOnError')).toBe(false);
      });
      it('can be set to false by global config option', () => {
        const { model, settings } = testContext;
        settings.set('features.scrollOnError', false);
        const form = new Form({ model, settings });
        expect(form.getAttribute('scrollOnError')).toBe(false);
      });
    });
  });
});