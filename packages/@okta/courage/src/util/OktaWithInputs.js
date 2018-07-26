/* eslint max-params: 0, max-statements: 0 */
define([
  'shared/util/Okta',
  'shared/views/forms/inputs/TextBox',
  'shared/views/forms/inputs/TextArea',
  'shared/views/forms/inputs/Select',
  'shared/views/forms/inputs/Radio',
  'shared/views/forms/inputs/CheckBox',
  'shared/views/forms/inputs/TextSelect',
  'shared/views/forms/inputs/TextPlusCopy',
  'shared/views/forms/inputs/TextPlusSelect',
  'shared/views/forms/inputs/DateBox',
  'shared/views/forms/inputs/NumberBox',
  'shared/views/forms/inputs/GroupPicker',
  'shared/views/forms/inputs/UserPicker',
  'shared/views/forms/inputs/AppPicker',
  'shared/views/forms/inputs/AppInstancePicker',
  'shared/views/forms/inputs/SUOrgsPicker',
  'shared/views/forms/inputs/ZonePicker',
  'shared/views/forms/inputs/ListInput',
  'shared/views/forms/inputs/InputGroup',
  'shared/views/forms/inputs/SimpleCheckBoxSet',
  'shared/views/forms/inputs/ImageFileUploader',
  'shared/views/forms/inputs/CertificationFileUploader',
  'shared/views/forms/inputs/MultiSearchableSelect',
  'shared/views/forms/inputs/SearchableSelect',
  'shared/views/forms/inputs/UniqueSelect',
  'shared/views/forms/BaseInput',
  'shared/views/forms/inputs/BasePicker',
  'shared/views/forms/inputs/BaseSelectize',
  'shared/views/forms/inputs/BaseFileUploader',
  'shared/views/forms/inputs/GroupSelect',
  'shared/views/forms/inputs/IdpPicker',
  'shared/views/forms/inputs/DateTimePicker',
  'shared/views/forms/inputs/CheckBoxSet',
  'shared/views/forms/inputs/TextBoxSet',
  'shared/views/forms/inputs/BooleanSelect',
  'shared/views/forms/inputs/DeletableBox',
  'shared/views/forms/inputs/PasswordBox',
],
function (Okta, TextBox, TextArea, Select, Radio, CheckBox, TextSelect, TextPlusCopy, TextPlusSelect, DateBox,
          NumberBox, GroupPicker, UserPicker, AppPicker, AppInstancePicker, SUOrgsPicker, ZonePicker, ListInput,
          InputGroup, SimpleCheckBoxSet, ImageFileUploader, CertificationFileUploader, MultiSearchableSelect,
          SearchableSelect, UniqueSelect, BaseInput, BasePicker, BaseSelectize, BaseFileUploader, GroupSelect,
          IdpPicker, DateTimePicker, CheckBoxSet, TextBoxSet, BooleanSelect, DeletableBox,
          PasswordBox) {

  Okta.internal.views.forms.inputs = Okta.internal.views.forms.inputs || {};

  var _ = Okta._;

  function hasGroups(options) {
    return _.size(options) > 0 && _.isObject(_.values(options)[0]);
  }

  function registerInput(type, input, name) {
    Okta.registerInput(type, input);
    Okta.internal.views.forms.inputs[name] = input;
  }

  function registerConditionalInput(type, fn, inputs) {
    Okta.registerInput(type, fn);
    _.each(inputs, function (input, key) {
      Okta.internal.views.forms.inputs[key] = input;
    });
  }

  var MAX_SELECT_OPTIONS_COUNT = 1000;
  var MAX_CHECKBOX_OPTIONS_COUNT = 150;

  registerInput('file/image', ImageFileUploader, 'ImageFileUploader');
  registerInput('file/cert', CertificationFileUploader, 'CertificationFileUploader');
  registerInput('textarea', TextArea, 'TextArea');
  registerInput('radio', Radio, 'Radio');
  registerInput('checkbox', CheckBox, 'CheckBox');
  registerInput('text', TextBox, 'TextBox');
  registerInput('password', PasswordBox, 'PasswordBox');
  registerInput('number', NumberBox, 'NumberBox');
  registerInput('textselect', TextSelect, 'TextSelect');
  registerInput('text+copy', TextPlusCopy, 'TextPlusCopy');
  registerInput('text+select', TextPlusSelect, 'TextPlusSelect');
  registerInput('select+text', TextPlusSelect, 'SelectPlusText');
  registerInput('date', DateBox, 'DateBox');
  registerInput('grouppicker', GroupPicker, 'GroupPicker');
  registerInput('userpicker', UserPicker, 'UserPicker');
  registerInput('apppicker', AppPicker, 'AppPicker');
  registerInput('appinstancepicker', AppInstancePicker, 'AppInstancePicker');
  registerInput('su-orgspicker', SUOrgsPicker, 'SUOrgsPicker');
  registerInput('zonepicker', ZonePicker, 'ZonePicker');
  registerInput('list', ListInput, 'ListInput');
  registerInput('group', InputGroup, 'InputGroup');
  registerInput('multiselect', MultiSearchableSelect, 'MultiSearchableSelect');
  registerInput('uniqueselect', UniqueSelect, 'UniqueSelect');

  registerConditionalInput('select', function (options) {
    return hasGroups(options.options) || _.size(options.options) > MAX_SELECT_OPTIONS_COUNT ? SearchableSelect : Select;
  }, {'SearchableSelect': SearchableSelect, 'Select': Select});

  registerConditionalInput('checkboxset', function (options) {
    return _.size(options.options) > MAX_CHECKBOX_OPTIONS_COUNT ? MultiSearchableSelect : SimpleCheckBoxSet;
  }, {'MultiSearchableSelect': MultiSearchableSelect, 'SimpleCheckBoxSet': SimpleCheckBoxSet});

  Okta.internal.views.forms.BaseInput = BaseInput;
  Okta.internal.views.forms.inputs.BasePicker = BasePicker;
  Okta.internal.views.forms.inputs.BaseSelectize = BaseSelectize;
  Okta.internal.views.forms.inputs.BaseFileUploader = BaseFileUploader;
  Okta.internal.views.forms.inputs.GroupSelect = GroupSelect;
  Okta.internal.views.forms.inputs.IdpPicker = IdpPicker;
  Okta.internal.views.forms.inputs.DateTimePicker = DateTimePicker;
  Okta.internal.views.forms.inputs.CheckBoxSet = CheckBoxSet;
  Okta.internal.views.forms.inputs.TextBoxSet = TextBoxSet;
  Okta.internal.views.forms.inputs.BooleanSelect = BooleanSelect;
  Okta.internal.views.forms.inputs.DeletableBox = DeletableBox;
  Okta.internal.views.forms.inputs.PasswordBox = PasswordBox;

  return Okta;

});
