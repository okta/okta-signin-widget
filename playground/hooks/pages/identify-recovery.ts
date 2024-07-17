import type {
  OktaSignInAPI as OktaSignInAPIV3,
  ButtonElement, DescriptionElement, TitleElement
} from '../../../src/v3/src/types';

export const addHookForIdentifyRecoveryForm = (oktaSignIn: OktaSignInAPIV3) => {
  // Tip for Sign-in page code editor: 
  //  Paste this code after `oktaSignIn = new OktaSignIn(config);`
  oktaSignIn.afterTransform('identify-recovery', (formBag) => {
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
