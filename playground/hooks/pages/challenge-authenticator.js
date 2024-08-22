export const addHookForChallengeAuthenticatorForm = (oktaSignIn) => {
    // Tip for Sign-in page code editor: 
    //  Paste this code after `oktaSignIn = new OktaSignIn(config);`
    oktaSignIn.afterTransform?.('challenge-authenticator', ({ formBag, currentAuthenticator, userInfo }) => {
        const stepper = formBag.uischema.elements.find(ele => ele.type === 'Stepper');
        if (stepper) {
            if (currentAuthenticator?.type === 'email') {
                // Show 'Enter code' form imediately
                stepper.elements.shift();
                // Customize texts
                const layout = stepper.elements[0];
                const reminder = layout.elements.find(ele => ele.type === 'Reminder');
                const title = layout.elements.find(ele => ele.type === 'Title');
                const description = layout.elements.find(ele => ele.type === 'Description');
                const input = layout.elements.find(ele => ele.type === 'Field');
                const emailAddress = userInfo?.profile?.email || userInfo?.identifier;
                title.options.content = 'Verify your email';
                description.options.content = `Click the verification link in the email we've sent to ${emailAddress} or enter the code below`;
                const labelTranslation = input.translations?.find(t => t.name === 'label');
                if (labelTranslation) {
                    labelTranslation.value = 'Enter code from email below:';
                }
                if (reminder) {
                    reminder.options.content = 'Haven\'t received email?';
                    reminder.options.buttonText = 'Resend';
                }
            }
        }
    });
};
