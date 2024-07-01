/* eslint no-console: 0 */

import {
  OktaSignInAPI,
  WidgetOptions,
} from '../../src/types';
import {
  ButtonElement, CustomLayout, DescriptionElement, DividerElement, FieldElement, LinkElement, 
  RegistrationElementSchema, ReminderElement, StepperLayout, StepperNavigatorElement, TitleElement, UISchemaElement, UISchemaLayout, UISchemaLayoutType, WidgetMessage,
} from '../../src/v3/src/types';
import { IdxMessage, IdxMessages } from '@okta/okta-auth-js';

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


export const addHookOptions = (options: WidgetOptions = {}) => {
  options.registration = {
    parseSchema: (schema: RegistrationElementSchema[], onSuccess) => {
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
            } as any
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

const addHookForEnrollProfileForm = (signIn: OktaSignInAPI) => {
  signIn.afterTransform('enroll-profile', (formBag) => {
    // Change title
    const titleIndex = formBag.uischema.elements.findIndex(ele => ele.type === 'Title');
    const title: TitleElement = formBag.uischema.elements[titleIndex] as TitleElement;
    title.options.content = 'Register new profile';

    // Change submit text
    const submitIndex = formBag.uischema.elements.findIndex(ele =>
      ele.type === 'Button' && (ele as ButtonElement).options.type === 'submit'
    );
    const submit: ButtonElement = formBag.uischema.elements[submitIndex] as ButtonElement;
    submit.label = 'Register';

    // Add custom description after title
    const descr: DescriptionElement = {
      type: 'Description',
      contentType: 'subtitle',
      options: {
        variant: 'body1', // or 'subtitle1' or 'legend'
        content: '<div class=\'my-enroll-description\'>Your<br />custom<br />description</div>'
      },
    };
    formBag.uischema.elements.splice(titleIndex + 1, 0, descr);

    // Customize custom string field - change label, validation messages, add validation by regex
    const fieldsToExclude = [];
    const customString = formBag.uischema.elements.find<FieldElement>((ele): ele is FieldElement =>
      ele.type === 'Field'
      && (ele as FieldElement).options.type === 'string'
      && (ele as FieldElement).options.inputMeta.name.includes('custom')
    );
    if (customString) {
      customString.translations.find(t => t.name === 'label').value = 'TIN';
      const customStringName = customString.options.inputMeta.name;
      const isProfileField = customStringName.includes('userProfile.');
      if (!isProfileField) {
        // This field was added with `registration.parseSchema` hook, not in admin panel
        fieldsToExclude.push(customStringName);
      }
      // validation
      const mapCustomStringError = (msg?: WidgetMessage) => {
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
        const value = formData[customStringName] as string;
        if (value && !validationMessages?.length) {
          if (!value.match(/^\d{9}$/)) {
            validationMessages.push({
              message: 'TIN should be a 9-digit number'
            });
          }
        }
        return validationMessages;
      };
      const customStringMessages = (customString.options.inputMeta as any).messages as IdxMessages;
      if (customStringMessages?.value?.length) {
        customStringMessages.value = customStringMessages.value.map(mapCustomStringError) as IdxMessage[];
      }
    }

    // Customize custom boolean field - add title, change label, validation messages
    const customBoolIndex = formBag.uischema.elements.findIndex((ele): ele is FieldElement =>
      ele.type === 'Field'
      && (ele as FieldElement).options.type === 'boolean'
      && (ele as FieldElement).options.inputMeta.name.includes('custom')
    );
    if (customBoolIndex != -1) {
      const customBool = formBag.uischema.elements[customBoolIndex] as FieldElement;
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
      } as DescriptionElement;
      formBag.uischema.elements.splice(customBoolIndex, 0, customBoolTitle);
      // validation
      const origCustomBoolValidate = formBag.dataSchema[customBoolName].validate;
      const mapCustomBoolError = (msg?: WidgetMessage) => {
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
        const value = formData[customBoolName] as boolean;
        if (!value && !validationMessages?.length) {
          // This field was added with `registration.parseSchema` hook, not in admin panel, so it won't be validated
          validationMessages.push({
            // will trigger warn "Avoid rendering unlocalized text sent from the API:"
            message: 'You should agree to the Terms and Conditions'
          });
        }
        return validationMessages;
      };
      const customBoolMessages = (customBool.options.inputMeta as any).messages as IdxMessages;
      if (customBoolMessages?.value?.length) {
        customBoolMessages.value = customBoolMessages.value.map(mapCustomBoolError) as IdxMessage[];
      }
    }

    formBag.dataSchema.fieldsToExclude = () => fieldsToExclude;
  });
};

const addHookForIdentifyRecoveryForm = (signIn: OktaSignInAPI) => {
  signIn.afterTransform('identify-recovery', (formBag) => {
    // Change title
    const titleIndex = formBag.uischema.elements.findIndex(ele => ele.type === 'Title');
    const title = formBag.uischema.elements[titleIndex] as TitleElement;
    title.options.content = 'Password reset';

    // Change submit button
    const submitIndex = formBag.uischema.elements.findIndex(ele =>
      ele.type === 'Button' && (ele as ButtonElement).options.type === 'submit'
    );
    const submit = formBag.uischema.elements[submitIndex] as ButtonElement;
    submit.label = 'Reset';

    // Add custom description after title
    const descr: DescriptionElement = {
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

const addHookForIdentifyForm = (signIn: OktaSignInAPI) => {
  signIn.afterTransform('identify', (formBag) => {
    // Change title
    const titleIndex = formBag.uischema.elements.findIndex(ele => ele.type === 'Title');
    const title = formBag.uischema.elements[titleIndex] as TitleElement;
    title.options.content = 'Login to WidgiCo';

    // Reorder elements
    const help = formBag.uischema.elements.find(ele =>
      ele.type === 'Link' && (ele as LinkElement).options.dataSe === 'help') as LinkElement;
    const unlock = formBag.uischema.elements.find(ele =>
      ele.type === 'Link' && (ele as LinkElement).options.dataSe === 'unlock') as LinkElement;
    const forgot = formBag.uischema.elements.find(ele =>
      ele.type === 'Link' && (ele as LinkElement).options.dataSe === 'forgot-password') as LinkElement;
    const submitIndex = formBag.uischema.elements.findIndex(ele =>
      ele.type === 'Button' && (ele as ButtonElement).options.type === 'submit');
    const submit = formBag.uischema.elements[submitIndex] as ButtonElement;
    submit.label = 'Login';
    const signupWrapper = formBag.uischema.elements.find(ele =>
      ele.type === 'HorizontalLayout' && (ele as UISchemaLayout).elements.find(ele =>
        ele.type === 'Link' && (ele as LinkElement).options.dataSe === 'enroll')) as UISchemaLayout;
    const signup = signupWrapper.elements.find(ele => ele.type === 'Link') as LinkElement;
    formBag.uischema.elements = formBag.uischema.elements.filter((ele: UISchemaElement) =>
      ele.type !== 'Divider'
      && !([help, unlock, forgot, signupWrapper] as UISchemaElement[]).includes(ele)
    );
    const newDivider: DividerElement = {
      type: 'Divider',
    };
    const newLinks: CustomLayout = {
      type: UISchemaLayoutType.HORIZONTAL,
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

const addHookForEnrollAuthenticatorForm = (signIn: OktaSignInAPI) => {
  signIn.afterTransform('enroll-authenticator', (formBag, { currentAuthenticator, userInfo }) => {
    const stepper = formBag.uischema.elements.find(ele => ele.type === 'Stepper') as StepperLayout;
    if (stepper) {
      // Show 'Enter code' form imediately
      stepper.elements.shift();
      // Customize texts
      const verifyLayout = stepper.elements[0] as UISchemaLayout;
      const reminder = verifyLayout.elements.find(ele => ele.type === 'Reminder') as ReminderElement;
      const title = verifyLayout.elements.find(ele => ele.type === 'Title') as TitleElement;
      const description = verifyLayout.elements.find(ele => ele.type === 'Description') as DescriptionElement;
      const input = verifyLayout.elements.find(ele => ele.type === 'Field') as FieldElement;
      if (currentAuthenticator.type === 'email') {
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

const addHookForAllForms = (signIn: OktaSignInAPI) => {
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
      const customLink: LinkElement = {
        type: 'Link',
        contentType: 'footer',
        options: {
          href: 'https://www.okta.com/terms-of-service/',
          target: '_blank',
          step: '',
          label: 'Terms of Service',
          dataSe: 'factorPageHelpLink',
        },
        id: 'terms-of-service-0',
        key: 'terms-of-service',
      };
      formBag.uischema.elements.push(customLink);
    }

    // Change Back link name
    const backLink = formBag.uischema.elements.find(ele =>
      ele.type === 'Link' && (ele as LinkElement).options.dataSe === 'cancel') as LinkElement;
    if (backLink) {
      backLink.options.label = 'Back';
    }

    console.log('>>> playground afterTransform hook for', formName, formBag, ' context:', context)
  });
};

export const addAfterTransformHooks = (signIn: OktaSignInAPI) => {
  addHookForEnrollProfileForm(signIn);
  addHookForIdentifyRecoveryForm(signIn);
  addHookForIdentifyForm(signIn);
  addHookForEnrollAuthenticatorForm(signIn);
  addHookForAllForms(signIn);
};
