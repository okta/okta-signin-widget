import { BaseModel } from 'okta';
import Expect from 'helpers/util/Expect';
import Spinner from 'views/shared/Spinner';

Expect.describe('Spinner', function() {
  it('does not have "hide" class if "visible" option is undefined', function() {
    this.spinner = new Spinner({
      model: new BaseModel(),
    });

    expect(this.spinner.$el.hasClass('hide')).toBe(false);
  });

  it('has "hide" class if "visible" option is false', function() {
    this.spinner = new Spinner({
      model: new BaseModel(),
      visible: false,
    });

    expect(this.spinner.$el.hasClass('hide')).toBe(true);
  });

  Expect.describe('modelEvents', function() {
    beforeEach(function() {
      this.spinner = new Spinner({
        model: new BaseModel(),
      });

      this.spinner.render();
    });

    it('removes "hide" class after "spinner:show" model event', function() {
      this.spinner.model.trigger('spinner:show');
      expect(this.spinner.$el.hasClass('hide')).toBe(false);
    });

    it('adds "hide" class after "spinner:hide" model event', function() {
      this.spinner.model.trigger('spinner:show');
      expect(this.spinner.$el.hasClass('hide')).toBe(false);

      this.spinner.model.trigger('spinner:hide');
      expect(this.spinner.$el.hasClass('hide')).toBe(true);
    });
  });
});
