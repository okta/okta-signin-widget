define([
  'helpers/util/Expect',
  'okta',
  'views/shared/TextBox',
  'sandbox'
],
function (Expect, Okta, TextBox, $sandbox) {
  Expect.describe('TextBox', function () {
    it('the value of aria-label is same as the placeholder', function () {
      var placeHolderValue = 'Test Value 123';
  
      var textbox = new TextBox({
        model: new Okta.BaseModel(),
        id: Okta._.uniqueId('textbox'),
        placeholder: placeHolderValue
      });

      $sandbox.html(textbox.render().el);  
      expect(textbox.$('#' + textbox.options.inputId).attr('aria-label')).toEqual(placeHolderValue);
    });

    it('has appropriate attributes for type="number"', function () {
      var textbox = new TextBox({
        model: new Okta.BaseModel(),
        id: Okta._.uniqueId('textbox'),
        type: 'number'
      });

      $sandbox.html(textbox.render().el);
      var input = textbox.$('#' + textbox.options.inputId);
      expect(input.attr('type')).toEqual('number');
      expect(input.attr('pattern')).toEqual('[0-9]*');
      expect(input.attr('inputmode')).toEqual('numeric');
    });

    it('invalid value for type="number"', function () {
      spyOn(Okta, 'loc');

      var textbox = new TextBox({
        model: new Okta.BaseModel(),
        id: Okta._.uniqueId('textbox'),
        type: 'number'
      });

      $sandbox.html(textbox.render().el);
      var input = textbox.$('#' + textbox.options.inputId);
      input.trigger('invalid');
      expect(Okta.loc).toHaveBeenCalledWith('error.number.required', 'login');
    });
  });
});
