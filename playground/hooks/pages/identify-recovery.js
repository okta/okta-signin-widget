export const addHookForIdentifyRecoveryForm = (oktaSignIn) => {
    // Tip for Sign-in page code editor: 
    //  Paste this code after `oktaSignIn = new OktaSignIn(config);`
    oktaSignIn.afterTransform('identify-recovery', (formBag) => {
        // Change title
        const titleIndex = formBag.uischema.elements.findIndex(ele => ele.type === 'Title');
        const title = formBag.uischema.elements[titleIndex];
        title.options.content = 'Password reset';
        // Change submit button
        const submitIndex = formBag.uischema.elements.findIndex(ele => ele.type === 'Button' && ele.options.type === 'submit');
        const submit = formBag.uischema.elements[submitIndex];
        submit.label = 'Reset';
        // Add custom description after title
        const descr = {
            type: 'Description',
            contentType: 'subtitle',
            options: {
                variant: 'body1',
                content: '<div class=\'my-reset-description\'>Description<br />about<br />recovery</div>'
            },
        };
        formBag.uischema.elements.splice(titleIndex + 1, 0, descr);
    });
};
