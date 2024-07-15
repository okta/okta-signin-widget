/* eslint no-console: 0 */
/**
 *  Notes
 *
 * 1. Demo of UI schema layout: see `src/v3/src/transformer/layout/development/transformEnumerateComponents.ts`
 *    Add `_ui-demo` mock to `idx['/idp/idx/introspect']` in `playground/mocks/config/responseConfig.js`
 *     and run `yarn workspace v3 dev`
 *    Components to be rendered by type: see `src/v3/src/components/Form/renderers.tsx`
 *
 * 2. Custom profile fields should be added in Okta admin panel (/admin/universaldirectory) if needs to be saved.
 *    Custom profile fields display can be configured at /admin/authn/policies
 *    https://help.okta.com/oie/en-us/content/topics/identity-engine/policies/create-profile-enrollment-form.htm
 *
 *    Fake custom profile fields can be added with `registration.parseSchema` hook.
 *     Eg. checkbox to agree to terms and conditions could be added with this hook without saving to backend
 *     (see `custom_bool`)
 *
 *    `afterTransform('enroll-profile')` hook demo expects `custom_string` profile field to be added in admin panel.
 *
 * 3. CSS selectors for style customizations can be not easy to write cause Gen3 doesn't use classes for key elements.
 *    But you can use `data-se` attribute for key elements and `:has()` selector for their parents/ancestors.
 *    See `./customize.css`
 *
 */
export const addHookOptions = (options = {}) => {
    options.registration = {
        parseSchema: (schema, onSuccess) => {
            // Note: custom fields added here would not be saved to backend
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
const addHookForEnrollProfileForm = (signIn) => {
    signIn.afterTransform('enroll-profile', (formBag) => {
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
        // Customize custom string field - change label, validation messages, add validation by regex
        const fieldsToExclude = [];
        const customString = formBag.uischema.elements.find((ele) => ele.type === 'Field'
            && ele.options.type === 'string'
            && ele.options.inputMeta.name.includes('custom'));
        if (customString) {
            customString.translations.find(t => t.name === 'label').value = 'TIN';
            const customStringName = customString.options.inputMeta.name;
            const isProfileField = customStringName.includes('userProfile.');
            if (!isProfileField) {
                // This field was added with `registration.parseSchema` hook, not in admin panel
                fieldsToExclude.push(customStringName);
            }
            // validation
            const mapCustomStringError = (msg) => {
                if (msg?.i18n?.key === 'model.validation.field.blank') {
                    return {
                        ...msg,
                        // will trigger warn "Avoid rendering unlocalized text sent from the API:"
                        i18n: undefined,
                        message: 'TIN should be specified',
                    };
                }
                return msg;
            };
            const origCustomStringValidate = formBag.dataSchema[customStringName].validate;
            formBag.dataSchema[customStringName].validate = (formData) => {
                const validationMessages = origCustomStringValidate(formData)?.map(mapCustomStringError);
                const value = formData[customStringName];
                if (value && !validationMessages?.length) {
                    if (!value.match(/^\d{9}$/)) {
                        validationMessages.push({
                            message: 'TIN should be a 9-digit number'
                        });
                    }
                }
                return validationMessages;
            };
            const customStringMessages = customString.options.inputMeta.messages;
            if (customStringMessages?.value?.length) {
                customStringMessages.value = customStringMessages.value.map(mapCustomStringError);
            }
        }
        // Customize custom boolean field - add title, change label, validation messages
        const customBoolIndex = formBag.uischema.elements.findIndex((ele) => ele.type === 'Field'
            && ele.options.type === 'boolean'
            && ele.options.inputMeta.name.includes('custom'));
        if (customBoolIndex != -1) {
            const customBool = formBag.uischema.elements[customBoolIndex];
            const customBoolName = customBool.options.inputMeta.name;
            const isProfileField = customBoolName.includes('userProfile.');
            if (!isProfileField) {
                // This field was added with `registration.parseSchema` hook, not in admin panel
                fieldsToExclude.push(customBoolName);
            }
            customBool.translations.find(t => t.name === 'label').value = 'I agree';
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
            // validation
            const origCustomBoolValidate = formBag.dataSchema[customBoolName].validate;
            const mapCustomBoolError = (msg) => {
                if (msg?.i18n?.key === 'platform.cvd.profile.property.constraint.violation.required.true') {
                    return {
                        ...msg,
                        // will trigger warn "Avoid rendering unlocalized text sent from the API:"
                        i18n: undefined,
                        message: 'You should agree to the Terms and Conditions',
                    };
                }
                return msg;
            };
            formBag.dataSchema[customBoolName].validate = (formData) => {
                const validationMessages = origCustomBoolValidate(formData)?.map(mapCustomBoolError) ?? [];
                const value = formData[customBoolName];
                if (!value && !validationMessages?.length) {
                    // This field was added with `registration.parseSchema` hook, not in admin panel, so it won't be validated
                    validationMessages.push({
                        // will trigger warn "Avoid rendering unlocalized text sent from the API:"
                        message: 'You should agree to the Terms and Conditions'
                    });
                }
                return validationMessages;
            };
            const customBoolMessages = customBool.options.inputMeta.messages;
            if (customBoolMessages?.value?.length) {
                customBoolMessages.value = customBoolMessages.value.map(mapCustomBoolError);
            }
        }
        formBag.dataSchema.fieldsToExclude = () => fieldsToExclude;
    });
};
const addHookForIdentifyRecoveryForm = (signIn) => {
    signIn.afterTransform('identify-recovery', (formBag) => {
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
const addHookForIdentifyForm = (signIn) => {
    signIn.afterTransform('identify', (formBag) => {
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
        const signup = signupWrapper.elements.find(ele => ele.type === 'Link');
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
const addHookForChallengeAuthenticatorForm = (signIn) => {
    signIn.afterTransform('challenge-authenticator', (formBag, { currentAuthenticator, userInfo }) => {
        const stepper = formBag.uischema.elements.find(ele => ele.type === 'Stepper');
        if (stepper) {
            if (currentAuthenticator.type === 'email') {
                // Show 'Enter code' form imediately
                stepper.elements.shift();
                // Customize texts
                const layout = stepper.elements[0];
                const reminder = layout.elements.find(ele => ele.type === 'Reminder');
                const title = layout.elements.find(ele => ele.type === 'Title');
                const description = layout.elements.find(ele => ele.type === 'Description');
                const input = layout.elements.find(ele => ele.type === 'Field');
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
const addHookForEnrollAuthenticatorForm = (signIn) => {
    signIn.afterTransform('enroll-authenticator', (formBag, { currentAuthenticator }) => {
        const stepper = formBag.uischema.elements.find(ele => ele.type === 'Stepper');
        if (stepper) {
            if (currentAuthenticator.type === 'security_question') {
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
                answer.options.inputMeta.secret = false;
                // Answer validation
                const origValidate = formBag.dataSchema['credentials.answer'].validate;
                formBag.dataSchema['credentials.answer'].validate = (formData) => {
                    const validationMessages = origValidate(formData);
                    const value = formData['credentials.answer'];
                    if (value && !validationMessages?.length) {
                        if (!value.match(/^[\w\d\s\-]{3,20}$/)) {
                            validationMessages.push({
                                message: 'Answer should have length from 3 to 20 and not contain special characters'
                            });
                        }
                    }
                    return validationMessages;
                };
            }
        }
    });
};
const addHookForAllForms = (signIn) => {
    signIn.afterTransform('*', (formBag, context) => {
        const { formName } = context;
        // Add Terms of Service link
        const formsWithTermsLink = [
            'identify',
            'select-authenticator-unlock-account',
            'unlock-account',
            'identify-recovery',
        ];
        if (formsWithTermsLink.includes(formName)) {
            const customLink = {
                type: 'Link',
                contentType: 'footer',
                options: {
                    href: 'https://www.okta.com/terms-of-service/',
                    target: '_blank',
                    step: '',
                    label: 'Terms of Service',
                    dataSe: 'customLink',
                },
            };
            formBag.uischema.elements.push(customLink);
        }
        // Change Back link name
        const backLink = formBag.uischema.elements.find(ele => ele.type === 'Link' && ele.options.dataSe === 'cancel');
        if (backLink) {
            backLink.options.label = 'Back';
        }
        console.log('>>> playground afterTransform hook for', formName, formBag, ' context:', context);
    });
};
export const addAfterTransformHooks = (signIn) => {
    const gen3 = typeof signIn.afterTransform === 'function';
    if (gen3) {
        addHookForEnrollProfileForm(signIn);
        addHookForIdentifyRecoveryForm(signIn);
        addHookForIdentifyForm(signIn);
        addHookForChallengeAuthenticatorForm(signIn);
        addHookForEnrollAuthenticatorForm(signIn);
        addHookForAllForms(signIn);
    }
};
