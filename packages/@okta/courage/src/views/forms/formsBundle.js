/* eslint max-params: [2, 36] */
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
  './helpers/InputRegistry',
],
function (BaseForm, BaseInput, TextCounterExplain, WizardTitle, EnumTypeHelper, ErrorBanner, ErrorParser, FormUtil,
  InputContainer, InputFactory, InputLabel, InputWrapper, SchemaFormFactory, InputRegistry) {

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

      SchemaFormFactory: SchemaFormFactory,

      InputRegistry: InputRegistry

    }

  };

});
