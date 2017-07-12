/* eslint max-params: 0 */
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
  '../inputs/SearchableSelect'
],
function (_, BaseInput, TextBox, TextArea, Select, Radio, CheckBox, TextSelect, TextPlusSelect, DateBox, NumberBox,
          GroupPicker, UserPicker, AppPicker, AppInstancePicker, SUOrgsPicker, ZonePicker, ListInput, InputGroup,
          SimpleCheckBoxSet, ImageFileUploader, CertificationFileUploader, SearchableSelect) {

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
    /* eslint complexity: 0 */
    options = _.clone(options);

    if (options.input) {
      return createInput(options.input, options);
    }

    var Input;
    if (inputTypesMap[options.type]) {
      // Chosen doesn't perform well with large option sets, so always use SearchableSelect in this case
      if (options.type == 'select' && _.size(options.options) > 1000) {
        Input = SearchableSelect;
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

  return {
    create: create,
    supports: supports
  };

});
