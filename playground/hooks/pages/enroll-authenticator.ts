import type {
  OktaSignInAPI as OktaSignInAPIV3,
  StepperLayout, FieldElement, UISchemaLayout, StepperRadioElement,
} from '../../../src/v3/src/types';

export const addHookForEnrollAuthenticatorForm = (oktaSignIn: OktaSignInAPIV3) => {
  // Tip for Sign-in page code editor: 
  //  Paste this code after `oktaSignIn = new OktaSignIn(config);`
  oktaSignIn.afterTransform?.('enroll-authenticator', ({ formBag, currentAuthenticator }) => {
    const stepper = formBag.uischema.elements.find(ele => ele.type === 'Stepper') as StepperLayout;
    if (stepper) {
      if (currentAuthenticator?.type === 'security_question') {
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
        if (answer) {
          answer.options.inputMeta.secret = false;
        }
      }
    }
  });
};
