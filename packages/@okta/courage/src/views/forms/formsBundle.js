/* eslint max-params: [2, 35] */
define([
  './BaseForm',
  './BaseInput',
  './components/TextCounterExplain',
  './components/WizardTitle',
  './helpers/EnumTypeHelper',
  './helpers/ErrorBanner',
  './helpers/ErrorParser',
  './helpers/FormUtil',
  './helpers/InputContainer',
  './helpers/InputFactory',
  './helpers/InputLabel',
  './helpers/InputWrapper',
  './helpers/SchemaFormFactory',
  './inputs/BaseFileUploader',
  './inputs/BasePicker',
  './inputs/BooleanSelect',
  './inputs/CertificationFileUploader',
  './inputs/CheckBox',
  './inputs/CheckBoxSet',
  './inputs/DateBox',
  './inputs/DateTimePicker',
  './inputs/DeletableBox',
  './inputs/GroupPicker',
  './inputs/GroupSelect',
  './inputs/IdpPicker',
  './inputs/NumberBox',
  './inputs/Radio',
  './inputs/ScopesPicker',
  './inputs/Select',
  './inputs/SimpleCheckBoxSet',
  './inputs/TextArea',
  './inputs/TextBox',
  './inputs/TextBoxSet',
  './inputs/TextSelect',
  './inputs/BaseSelectize'
],
function (BaseForm, BaseInput, TextCounterExplain, WizardTitle, EnumTypeHelper, ErrorBanner, ErrorParser, FormUtil, 
  InputContainer, InputFactory, InputLabel, InputWrapper, SchemaFormFactory, BaseFileUploader, BasePicker, 
  BooleanSelect, CertificationFileUploader, CheckBox, CheckBoxSet, DateBox, DateTimePicker, DeletableBox, GroupPicker, 
  GroupSelect, IdpPicker, NumberBox, Radio, ScopesPicker, Select, SimpleCheckBoxSet, TextArea, TextBox, TextBoxSet, 
  TextSelect, BaseSelectize) {

  return {

    BaseForm: BaseForm,

    BaseInput: BaseInput,

    components: {

      TextCounterExplain: TextCounterExplain,
    
      WizardTitle: WizardTitle
    },

    helpers: {

      EnumTypeHelper: EnumTypeHelper,

      ErrorBanner: ErrorBanner,

      ErrorParser: ErrorParser,

      FormUtil: FormUtil,

      InputContainer: InputContainer,

      InputFactory: InputFactory,

      InputLabel: InputLabel,

      InputWrapper: InputWrapper,

      SchemaFormFactory: SchemaFormFactory
    
    },

    inputs: {

      BaseFileUploader: BaseFileUploader,

      BasePicker: BasePicker,
      
      BooleanSelect: BooleanSelect,

      CertificationFileUploader: CertificationFileUploader,

      CheckBox: CheckBox,

      CheckBoxSet: CheckBoxSet,

      DateBox: DateBox,

      DateTimePicker: DateTimePicker,

      DeletableBox: DeletableBox,

      GroupPicker: GroupPicker,

      GroupSelect: GroupSelect,

      IdpPicker: IdpPicker,

      NumberBox: NumberBox,

      Radio: Radio,

      ScopesPicker: ScopesPicker,

      Select: Select,

      SimpleCheckBoxSet: SimpleCheckBoxSet,

      TextArea: TextArea,

      TextBox: TextBox,

      TextBoxSet: TextBoxSet,

      TextSelect: TextSelect,

      BaseSelectize: BaseSelectize

    }

  };

});
