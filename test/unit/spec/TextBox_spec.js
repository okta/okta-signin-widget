import { BaseModel, _ } from 'okta';
import Expect from 'helpers/util/Expect';
import $sandbox from 'sandbox';
import TextBox from 'views/shared/TextBox';

Expect.describe('TextBox', function() {
  it('the value of aria-label is same as the placeholder', function() {
    const placeHolderValue = 'Test Value 123';
    const textbox = new TextBox({
      model: new BaseModel(),
      id: _.uniqueId('textbox'),
      placeholder: placeHolderValue,
    });

    $sandbox.html(textbox.render().el);
    expect(textbox.$('#' + textbox.options.inputId).attr('aria-label')).toEqual(placeHolderValue);
  });

  it('has appropriate attributes for type="number"', function() {
    const textbox = new TextBox({
      model: new BaseModel(),
      id: _.uniqueId('textbox'),
      type: 'number',
    });

    $sandbox.html(textbox.render().el);
    const input = textbox.$('#' + textbox.options.inputId);

    expect(input.attr('type')).toEqual('number');
    expect(input.attr('pattern')).toEqual('[0-9]*');
    expect(input.attr('inputmode')).toEqual('numeric');
  });
});
