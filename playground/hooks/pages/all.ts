import type {
  OktaSignInAPI as OktaSignInAPIV3,
  LinkElement,
} from '../../../src/v3/src/types';

export const addHookForAllForms = (oktaSignIn: OktaSignInAPIV3) => {
  // Tip for Sign-in page code editor: 
  //  Paste this code after `oktaSignIn = new OktaSignIn(config);`
  oktaSignIn.afterTransform('*', (context) => {
    const { formBag, formName } = context;
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
          dataSe: 'customLink',
        },
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

