/* eslint max-params: 0, complexity: 0, max-statements: 0 */
define([
  'okta/underscore',
  '../BaseInput',
  '../inputs/TextBox',
  '../inputs/TextArea',
  '../inputs/Select',
  '../inputs/Radio',
  '../inputs/CheckBox',
  '../inputs/TextSelect',
  '../inputs/TextPlusSelect',
  '../inputs/DateBox',
  '../inputs/NumberBox',
  '../inputs/GroupPicker',
  '../inputs/UserPicker',
  '../inputs/AppPicker',
  '../inputs/AppInstancePicker',
  '../inputs/SUOrgsPicker',
  '../inputs/ZonePicker',
  '../inputs/ListInput',
  '../inputs/InputGroup',
  '../inputs/SimpleCheckBoxSet',
  '../inputs/ImageFileUploader',
  '../inputs/CertificationFileUploader',
  '../inputs/MultiSearchableSelect',
  '../inputs/SearchableSelect'
],
function (_, BaseInput, TextBox, TextArea, Select, Radio, CheckBox, TextSelect, TextPlusSelect, DateBox, NumberBox,
          GroupPicker, UserPicker, AppPicker, AppInstancePicker, SUOrgsPicker, ZonePicker, ListInput, InputGroup,
          SimpleCheckBoxSet, ImageFileUploader, CertificationFileUploader, MultiSearchableSelect, SearchableSelect) {

  var MAX_SELECT_OPTIONS_COUNT = 1000;
  var MAX_CHECKBOX_OPTIONS_COUNT = 150;

  var inputTypesMap = {
    'file/image': ImageFileUploader,
    'file/cert': CertificationFileUploader,
    'select': Select,
    'textarea': TextArea,
    'radio': Radio,
    'checkbox': CheckBox,
    'text': TextBox,
    'password': TextBox,
    'number': NumberBox,
    'textselect': TextSelect,
    'text+select': TextPlusSelect,
    'select+text': TextPlusSelect,
    'date': DateBox,
    'grouppicker': GroupPicker,
    'userpicker': UserPicker,
    'apppicker': AppPicker,
    'appinstancepicker': AppInstancePicker,
    'su-orgspicker': SUOrgsPicker,
    'zonepicker': ZonePicker,
    'list': ListInput,
    'group': InputGroup,
    'multiselect': MultiSearchableSelect,
    'checkboxset': SimpleCheckBoxSet
  };

  function createInput(Input, options) {
    if (Input.prototype instanceof BaseInput) {
      return new Input(_.omit(options, 'input'));
    }
    else {
      return Input;
    }
  }

  function create(options) {
    options = _.clone(options);

    if (options.input) {
      return createInput(options.input, options);
    }

    var Input;
    if (inputTypesMap[options.type]) {
      // Chosen doesn't perform well with large option sets, so always use SearchableSelect in this case
      // If the options contains groups then use SearchableSelect
      if (options.type === 'select' &&
         (hasGroups(options.options) ||
          _.size(options.options) > MAX_SELECT_OPTIONS_COUNT)) {
        Input = SearchableSelect;
      }
      // checkbox doesn't perform well with larget option sets, always use multiselect instead.
      else if (options.type === 'checkboxset' && _.size(options.options) > MAX_CHECKBOX_OPTIONS_COUNT) {
        Input = MultiSearchableSelect;
      }
      else {
        Input = inputTypesMap[options.type];
      }
    }
    else {
      throw new Error('unknown input: ' + options.type);
    }
    return createInput(Input, options);
  }

  function supports(input) {
    return !!input.input || input.type in inputTypesMap;
  }

  function hasGroups(options) {
    return _.size(options) > 0 && _.isObject(_.values(options)[0]);
  }

  return {
    create: create,
    supports: supports
  };

});
