export const addHookForIdentifyForm = (oktaSignIn) => {
    // Tip for Sign-in page code editor: 
    //  Paste this code after `oktaSignIn = new OktaSignIn(config);`
    oktaSignIn.afterTransform('identify', ({ formBag }) => {
        // Change title
        const titleIndex = formBag.uischema.elements.findIndex(ele => ele.type === 'Title');
        const title = formBag.uischema.elements[titleIndex];
        title.options.content = 'Login to WidgiCo';
        // Reorder elements
        const help = formBag.uischema.elements.find(ele => ele.type === 'Link' && ele.options.dataSe === 'help');
        const unlock = formBag.uischema.elements.find(ele => ele.type === 'Link' && ele.options.dataSe === 'unlock');
        const forgot = formBag.uischema.elements.find(ele => ele.type === 'Link' && ele.options.dataSe === 'forgot-password');
        const submitIndex = formBag.uischema.elements.findIndex(ele => ele.type === 'Button' && ele.options.type === 'submit');
        const submit = formBag.uischema.elements[submitIndex];
        submit.label = 'Login';
        const signupWrapper = formBag.uischema.elements.find(ele => ele.type === 'HorizontalLayout' && ele.elements.find(ele => ele.type === 'Link' && ele.options.dataSe === 'enroll'));
        const signup = signupWrapper?.elements.find(ele => ele.type === 'Link');
        formBag.uischema.elements = formBag.uischema.elements.filter((ele) => ele.type !== 'Divider'
            && ![help, unlock, forgot, signupWrapper].includes(ele));
        const newDivider = {
            type: 'Divider',
        };
        const newLinks = {
            type: 'HorizontalLayout',
            elements: [
                unlock,
                forgot,
                signup,
                help,
            ].filter(ele => !!ele)
        };
        formBag.uischema.elements.splice(submitIndex + 1, 0, newDivider);
        formBag.uischema.elements.splice(submitIndex + 2, 0, newLinks);
        return;
    });
};
