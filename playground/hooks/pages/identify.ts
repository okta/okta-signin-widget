import type {
  OktaSignInAPI as OktaSignInAPIV3,
  ButtonElement, CustomLayout, DividerElement, LinkElement,  TitleElement, UISchemaElement, 
  UISchemaLayout, UISchemaLayoutType,
} from '../../../src/v3/src/types';

export const addHookForIdentifyForm = (oktaSignIn: OktaSignInAPIV3) => {
  // Tip for Sign-in page code editor: 
  //  Paste this code after `oktaSignIn = new OktaSignIn(config);`
  oktaSignIn.afterTransform('identify', ({ formBag }) => {
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
    const signup = signupWrapper?.elements.find(ele => ele.type === 'Link') as LinkElement;
    formBag.uischema.elements = formBag.uischema.elements.filter((ele: UISchemaElement) =>
      ele.type !== 'Divider'
      && !([help, unlock, forgot, signupWrapper] as UISchemaElement[]).includes(ele)
    );
    const newDivider: DividerElement = {
      type: 'Divider',
    };
    const newLinks: CustomLayout = {
      type: 'HorizontalLayout' as UISchemaLayoutType, // UISchemaLayoutType.HORIZONTAL,
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
