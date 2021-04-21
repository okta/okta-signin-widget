import { BaseModel } from 'okta';
import Spinner from 'views/shared/Spinner';

describe('Spinner', () => {
  describe('visibiity', () => {
    it('does not have "hide" class if "visible" option is undefined', () => {
      const spinner = new Spinner({
        model: new BaseModel(),
      });
  
      expect(spinner.$el.hasClass('hide')).toBe(false);
    });
  
    it('has "hide" class if "visible" option is false', () => {
      const spinner = new Spinner({
        model: new BaseModel(),
        visible: false,
      });
  
      expect(spinner.$el.hasClass('hide')).toBe(true);
    });
  });

  describe('modelEvents', () => {
    let spinner;

    beforeEach(() => {
      spinner = new Spinner({
        model: new BaseModel(),
      });

      spinner.render();
    });

    it('removes "hide" class after "spinner:show" model event', () => {
      spinner.model.trigger('spinner:show');
      expect(spinner.$el.hasClass('hide')).toBe(false);
    });

    it('adds "hide" class after "spinner:hide" model event', () => {
      spinner.model.trigger('spinner:show');
      expect(spinner.$el.hasClass('hide')).toBe(false);

      spinner.model.trigger('spinner:hide');
      expect(spinner.$el.hasClass('hide')).toBe(true);
    });
  });
});
