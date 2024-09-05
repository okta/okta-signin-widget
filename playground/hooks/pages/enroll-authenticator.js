export const addHookForEnrollAuthenticatorForm = (oktaSignIn) => {
    // Tip for Sign-in page code editor: 
    //  Paste this code after `oktaSignIn = new OktaSignIn(config);`
    oktaSignIn.afterTransform?.('enroll-authenticator', ({ formBag, currentAuthenticator }) => {
        const stepper = formBag.uischema.elements.find(ele => ele.type === 'Stepper');
        if (stepper) {
            if (currentAuthenticator?.type === 'security_question') {
                // Allow only pre-defined security questions
                stepper.elements.pop();
                const layout = stepper.elements[0];
                const stepperRadio = layout.elements.find((ele) => ele.type === 'StepperRadio');
                // Hide question type switcher (`display: none` is set via CSS), but don't remove
                stepperRadio.options.name = 'hideQuestionTypeStepper';
                // Don't mask answer
                const answer = layout.elements.find((ele) => ele.type === 'Field'
                    && ele.options.type === 'string'
                    && ele.options.inputMeta.name === 'credentials.answer');
                if (answer) {
                    answer.options.inputMeta.secret = false;
                }
            }
        }
    });
};
