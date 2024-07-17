import type {
  OktaSignInAPI as OktaSignInAPIV3,
  WidgetOptions as WidgetOptionsV3,
  StepperLayout, FieldElement, UISchemaLayout, StepperRadioElement,
} from '../../../src/v3/src/types';

export const customizeWidgetOptionsForEnrollAuthenticatorForm = (config: WidgetOptionsV3 = {}) => {
  // Tip for Sign-in page code editor: 
  //  Paste this code after `config = OktaUtil.getSignInWidgetConfig();`
  config.i18n = {
    ...config.i18n,
    en: {
      ...(config.i18n?.en ?? {}),
      'custom.validation.security_question.answer': 'Answer should have length from 3 to 20 and not contain special characters',
    }
  };
};

export const addHookForEnrollAuthenticatorForm = (oktaSignIn: OktaSignInAPIV3) => {
  // Tip for Sign-in page code editor: 
  //  Paste this code after `oktaSignIn = new OktaSignIn(config);`
  oktaSignIn.afterTransform('enroll-authenticator', (formBag, { currentAuthenticator }) => {
    const stepper = formBag.uischema.elements.find(ele => ele.type === 'Stepper') as StepperLayout;
    if (stepper) {
      if (currentAuthenticator.type === 'security_question') {
        // Allow only pre-defined security questions
        stepper.elements.pop();
        const layout = stepper.elements[0] as UISchemaLayout;
        const stepperRadio = layout.elements.find((ele) => ele.type === 'StepperRadio') as StepperRadioElement;
        // Hide question type switcher (`display: none` is set via CSS), but don't remove
        stepperRadio.options.name = 'hideQuestionTypeStepper';
        // Don't mask answer
        const answer = layout.elements.find<FieldElement>((ele): ele is FieldElement =>
          ele.type === 'Field'
          && (ele as FieldElement).options.type === 'string'
          && (ele as FieldElement).options.inputMeta.name === 'credentials.answer'
        );
        answer.options.inputMeta.secret = false;
        // Answer validation
        const origValidate = formBag.dataSchema['credentials.answer'].validate;
        formBag.dataSchema['credentials.answer'].validate = (formData) => {
          const validationMessages = origValidate(formData);
          const value = formData['credentials.answer'] as string;
          if (value && !validationMessages?.length) {
            if (!value.match(/^[\w\d\s\-]{3,20}$/)) {
              validationMessages.push({
                i18n: {
                  key: 'custom.validation.security_question.answer'
                }
              });
            }
          }
          return validationMessages;
        };
      }
    }
  });
};
