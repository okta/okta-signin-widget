import type {
  OktaSignInAPI as OktaSignInAPIV3,
  WidgetOptions as WidgetOptionsV3,
  RegistrationElementSchema,
  ButtonElement, DescriptionElement, FieldElement, TitleElement, WidgetMessage,
} from '../../../src/v3/src/types';
import type { IdxMessage, IdxMessages } from '@okta/okta-auth-js';

export const customizeWidgetOptionsForHForEnrollProfileForm = (config: WidgetOptionsV3 = {}) => {
  // Tip for Sign-in page code editor: 
  //  Paste this code after `config = OktaUtil.getSignInWidgetConfig();`
  config.i18n = {
    ...config.i18n,
    en: {
      ...(config.i18n?.en ?? {}),
      'custom.validation.field.blank': 'Custom field {0} should be specified',
      'custom.validation.field.terms.required': 'You should agree to the Terms and Conditions',
      'custom.validation.field.tin.incorrect': 'TIN should be a 9-digit number',
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
    parseSchema: (schema: RegistrationElementSchema[], onSuccess) => {
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
            } as any
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


export const addHookForEnrollProfileForm = (oktaSignIn: OktaSignInAPIV3) => {
  // Tip for Sign-in page code editor: 
  //  Paste this code after `oktaSignIn = new OktaSignIn(config);`
  oktaSignIn.afterTransform('enroll-profile', (formBag) => {
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

    // Customize custom string field (`custom_string`) - change label, validation messages, add validation by regex
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
      const mapCustomStringError = (msg?: WidgetMessage): WidgetMessage => {
        if (msg?.i18n?.key === 'model.validation.field.blank') {
          return {
            ...msg,
            i18n: {
              key: 'custom.validation.field.blank',
              params: [ 'TIN' ]
            },
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
              i18n: {
                key: 'custom.validation.field.tin.incorrect'
              }
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

    // Customize custom boolean field (`custom_bool`) - add title, change label, validation messages
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
      const mapCustomBoolError = (msg?: WidgetMessage): WidgetMessage => {
        if (msg?.i18n?.key === 'platform.cvd.profile.property.constraint.violation.required.true') {
          return {
            ...msg,
            i18n: {
              key: 'custom.validation.field.terms.required'
            },
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
            i18n: {
              key: 'custom.validation.field.terms.required'
            },
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
