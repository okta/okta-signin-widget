export const customizeWidgetOptionsForEnrollProfileForm = (config = {}) => {
    // Tip for Sign-in page code editor: 
    //  Paste this code after `config = OktaUtil.getSignInWidgetConfig();`
    config.i18n = {
        ...config.i18n,
        en: {
            ...(config.i18n?.en ?? {}),
            'custom.field.terms.label': 'I agree',
            'custom.field.tin.label': 'TIN',
        }
    };
    // Tip for Sign-in page code editor: 
    //  You can paste this code after `config = OktaUtil.getSignInWidgetConfig();`
    //  But note that custom fields added with `parseSchema` callback would not be saved to Okta backend!
    //  If value of custom profile field needs to be saved to Okta backend
    //   please add custom fields in Okta admin panel (/admin/universaldirectory) instead of this callback.
    //  In this example boolean "Agree to Terms and Conditions" can be added just in `parseSchema` callback.
    //  But string field "TIN" should be added in Okta admin panel instead!
    config.registration = {
        ...(config.registration ?? {}),
        // https://github.com/okta/okta-signin-widget?tab=readme-ov-file#parseschema
        parseSchema: (schema, onSuccess) => {
            // Add custom boolean "Agree to Terms and Conditions"
            if (!schema.find(f => f.name.includes('custom_bool'))) {
                schema.push({
                    label: 'Custom bool',
                    name: 'custom_bool',
                    type: 'boolean',
                    required: true,
                    options: [{
                            label: 'display',
                            value: {
                                type: 'object',
                                value: {
                                    inputType: 'checkbox'
                                }
                            }
                        }]
                });
            }
            // Add custom string "TIN"
            if (!schema.find(f => f.name.includes('custom_string'))) {
                schema.push({
                    label: 'Custom string',
                    name: 'custom_string',
                    type: 'string',
                    required: true,
                    minLength: 9,
                    maxLength: 9,
                });
            }
            onSuccess(schema);
        },
    };
};
export const addHookForEnrollProfileForm = (oktaSignIn) => {
    // Tip for Sign-in page code editor: 
    //  Paste this code after `oktaSignIn = new OktaSignIn(config);`
    oktaSignIn.afterTransform?.('enroll-profile', ({ formBag, loc }) => {
        // Change title
        const titleIndex = formBag.uischema.elements.findIndex(ele => ele.type === 'Title');
        const title = formBag.uischema.elements[titleIndex];
        title.options.content = 'Register new profile';
        // Change submit text
        const submitIndex = formBag.uischema.elements.findIndex(ele => ele.type === 'Button' && ele.options.type === 'submit');
        const submit = formBag.uischema.elements[submitIndex];
        submit.label = 'Register';
        // Add custom description after title
        const descr = {
            type: 'Description',
            contentType: 'subtitle',
            options: {
                variant: 'body1',
                content: '<div class=\'my-enroll-description\'>Your<br />custom<br />description</div>'
            },
        };
        formBag.uischema.elements.splice(titleIndex + 1, 0, descr);
        // Customize custom string field (`custom_string`) - change label
        const customString = formBag.uischema.elements.find((ele) => ele.type === 'Field'
            && ele.options.type === 'string'
            && ele.options.inputMeta.name.includes('custom'));
        const labelTranslation = customString?.translations?.find(t => t.name === 'label');
        if (labelTranslation) {
            labelTranslation.value = loc('custom.field.tin.label');
        }
        // Customize custom boolean field (`custom_bool`) - add title, change label (with i18n support)
        const customBoolIndex = formBag.uischema.elements.findIndex((ele) => ele.type === 'Field'
            && ele.options.type === 'boolean'
            && ele.options.inputMeta.name.includes('custom'));
        if (customBoolIndex != -1) {
            const customBool = formBag.uischema.elements[customBoolIndex];
            const labelTranslation = customBool.translations?.find(t => t.name === 'label');
            if (labelTranslation) {
                labelTranslation.value = loc('custom.field.terms.label');
            }
            const customBoolTitle = {
                type: 'Description',
                noMargin: true,
                contentType: 'subtitle',
                options: {
                    content: '<span class=\'custom_bool_title\'>Terms and Conditions</span><br />'
                        + '<a target=\'_blank\' href=\'https://www.okta.com/terms-of-service/\'>Link</a>',
                    variant: 'body1',
                },
            };
            formBag.uischema.elements.splice(customBoolIndex, 0, customBoolTitle);
        }
    });
};
