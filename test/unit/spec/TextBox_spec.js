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
  });
});
