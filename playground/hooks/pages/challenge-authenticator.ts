import type {
  OktaSignInAPI as OktaSignInAPIV3,
  DescriptionElement, FieldElement, ReminderElement, StepperLayout, TitleElement,  UISchemaLayout,
} from '../../../src/v3/src/types';

export const addHookForChallengeAuthenticatorForm = (oktaSignIn: OktaSignInAPIV3) => {
  // Tip for Sign-in page code editor: 
  //  Paste this code after `oktaSignIn = new OktaSignIn(config);`
  oktaSignIn.afterTransform('challenge-authenticator', ({ formBag, currentAuthenticator, userInfo }) => {
    const stepper = formBag.uischema.elements.find(ele => ele.type === 'Stepper') as StepperLayout;
    if (stepper) {
      if (currentAuthenticator.type === 'email') {
        // Show 'Enter code' form imediately
        stepper.elements.shift();
        // Customize texts
        const layout = stepper.elements[0] as UISchemaLayout;
        const reminder = layout.elements.find(ele => ele.type === 'Reminder') as ReminderElement;
        const title = layout.elements.find(ele => ele.type === 'Title') as TitleElement;
        const description = layout.elements.find(ele => ele.type === 'Description') as DescriptionElement;
        const input = layout.elements.find(ele => ele.type === 'Field') as FieldElement;
        const emailAddress = userInfo?.profile?.email || userInfo.identifier;
        title.options.content = 'Verify your email';
        description.options.content = `Click the verification link in the email we've sent to ${emailAddress} or enter the code below`;
        input.translations.find(t => t.name === 'label').value = 'Enter code from email below:';
        if (reminder) {
          reminder.options.content = 'Haven\'t received email?';
          reminder.options.buttonText = 'Resend';
        }
      }
    }
  });
};
