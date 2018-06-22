define([
  'okta',
  '@okta/courage/src/views/forms/inputs/TextBox',
  '@okta/courage/src/views/forms/inputs/PasswordBox',
  '@okta/courage/src/views/forms/inputs/CheckBox',
  '@okta/courage/src/views/forms/inputs/Radio',
  '@okta/courage/src/views/forms/inputs/Select',
],
function(Okta, TextBox, PasswordBox, CheckBox, Radio, Select) {

  Okta.registerInput('text', TextBox);
  Okta.registerInput('password', PasswordBox);
  Okta.registerInput('checkbox', CheckBox);
  Okta.registerInput('radio', Radio);
  Okta.registerInput('select', Select);

});